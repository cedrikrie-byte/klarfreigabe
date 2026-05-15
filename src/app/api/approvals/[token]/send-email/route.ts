import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getCurrentUser } from "@/lib/auth";
import { APP_NAME, getPublicUrl } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

type SendEmailRouteProps = {
  params: Promise<{
    token: string;
  }>;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatVehicleLine(vehicle: string | null, licensePlate: string | null) {
  if (!vehicle && !licensePlate) {
    return "";
  }

  return `${vehicle ?? ""}${vehicle && licensePlate ? " · " : ""}${
    licensePlate ?? ""
  }`;
}

function getEmailSubject(companyName: string, jobTitle: string) {
  return `Freigabe erforderlich: ${jobTitle} – ${companyName}`;
}

function getSafeOptionalHtmlLine(label: string, value: string | null) {
  if (!value) {
    return "";
  }

  return `
    <p style="margin:6px 0 0; color:#475569; font-size:14px;">
      <strong>${label}:</strong> ${escapeHtml(value)}
    </p>
  `;
}

export async function POST(request: Request, { params }: SendEmailRouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Nicht eingeloggt." },
      { status: 401 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY fehlt." },
      { status: 500 }
    );
  }

  try {
    const { token } = await params;

    const approval = await prisma.approval.findUnique({
      where: {
        token,
      },
      include: {
        documentationItem: {
          include: {
            photos: true,
            job: {
              include: {
                company: true,
                customer: true,
              },
            },
          },
        },
      },
    });

    if (!approval) {
      return NextResponse.json(
        { error: "Freigabe nicht gefunden." },
        { status: 404 }
      );
    }

    const item = approval.documentationItem;
    const job = item.job;
    const company = job.company;
    const customer = job.customer;

    if (company.id !== user.companyId) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diese Freigabe." },
        { status: 403 }
      );
    }

    if (job.status === "ARCHIVED") {
      return NextResponse.json(
        { error: "Für archivierte Aufträge können keine Freigabe-Mails gesendet werden." },
        { status: 400 }
      );
    }

    if (!item.approvalRequired) {
      return NextResponse.json(
        { error: "Diese Dokumentation benötigt keine Kundenfreigabe." },
        { status: 400 }
      );
    }

    if (approval.status !== "PENDING") {
      return NextResponse.json(
        { error: "Diese Freigabe wurde bereits beantwortet." },
        { status: 400 }
      );
    }

    if (!customer.email) {
      return NextResponse.json(
        { error: "Für diesen Kunden ist keine E-Mail-Adresse hinterlegt." },
        { status: 400 }
      );
    }

    const approvalUrl = getPublicUrl(`/f/${token}`);
    const resend = new Resend(apiKey);

    const vehicleLine = formatVehicleLine(job.vehicle, job.licensePlate);

    const safeAppName = escapeHtml(APP_NAME);
    const safeCustomerName = escapeHtml(customer.name);
    const safeCompanyName = escapeHtml(company.name);
    const safeJobTitle = escapeHtml(job.title);
    const safeItemTitle = escapeHtml(item.title);
    const safeDescription = escapeHtml(item.description).replaceAll(
      "\n",
      "<br />"
    );
    const safePriceText = item.priceText ? escapeHtml(item.priceText) : "";
    const safeVehicleLine = vehicleLine ? escapeHtml(vehicleLine) : "";
    const safeApprovalUrl = escapeHtml(approvalUrl);

    const safeCompanyPhone = company.phone ? escapeHtml(company.phone) : "";
    const safeCompanyEmail = company.email ? escapeHtml(company.email) : "";
    const safeCompanyAddress = company.address
      ? escapeHtml(company.address).replaceAll("\n", "<br />")
      : "";

    const photoCount = item.photos.length;

    const subject = getEmailSubject(company.name, job.title);

    const html = `
      <div style="margin:0; padding:0; background:#f8fafc;">
        <div style="max-width:680px; margin:0 auto; padding:32px 16px; font-family:Arial, sans-serif; color:#0f172a;">
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:20px; overflow:hidden;">
            <div style="padding:28px 28px 22px; background:#020617; color:#ffffff;">
              <p style="margin:0 0 12px; color:#cbd5e1; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.08em;">
                ${safeAppName}
              </p>

              <h1 style="margin:0; font-size:26px; line-height:1.25; color:#ffffff;">
                Freigabe für Ihren Auftrag erforderlich
              </h1>

              <p style="margin:14px 0 0; color:#cbd5e1; font-size:15px; line-height:1.6;">
                ${safeCompanyName} hat eine Zusatzarbeit dokumentiert und bittet Sie um Prüfung.
              </p>
            </div>

            <div style="padding:28px;">
              <p style="margin:0; font-size:16px; line-height:1.7;">
                Hallo ${safeCustomerName},
              </p>

              <p style="margin:12px 0 0; font-size:16px; line-height:1.7;">
                zu Ihrem Auftrag wurde eine zusätzliche Arbeit festgestellt. Bitte öffnen Sie den folgenden Link und wählen Sie dort
                <strong>„Freigeben“</strong> oder senden Sie eine <strong>Rückfrage</strong>.
              </p>

              <div style="margin:24px 0 0; padding:18px; border-radius:16px; background:#f1f5f9;">
                <p style="margin:0 0 8px; color:#64748b; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.04em;">
                  Auftrag
                </p>
                <p style="margin:0; font-size:17px; font-weight:700;">${safeJobTitle}</p>
                ${
                  safeVehicleLine
                    ? `<p style="margin:8px 0 0; color:#475569; font-size:14px;">${safeVehicleLine}</p>`
                    : ""
                }
              </div>

              <div style="margin:16px 0 0; padding:18px; border:1px solid #e2e8f0; border-radius:16px;">
                <p style="margin:0 0 8px; color:#64748b; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.04em;">
                  Zusatzarbeit
                </p>

                <p style="margin:0; font-size:17px; font-weight:700;">${safeItemTitle}</p>

                <p style="margin:12px 0 0; color:#475569; font-size:15px; line-height:1.7;">
                  ${safeDescription}
                </p>

                ${
                  safePriceText
                    ? `<div style="margin:16px 0 0; padding:14px; border-radius:14px; background:#f8fafc;">
                        <p style="margin:0; color:#64748b; font-size:13px;">Kostenschätzung</p>
                        <p style="margin:4px 0 0; font-size:19px; font-weight:700; color:#0f172a;">${safePriceText}</p>
                      </div>`
                    : ""
                }

                ${
                  photoCount > 0
                    ? `<p style="margin:14px 0 0; color:#64748b; font-size:13px;">
                        ${photoCount} Foto${photoCount === 1 ? "" : "s"} zur Dokumentation hinterlegt.
                      </p>`
                    : ""
                }
              </div>

              <div style="margin:26px 0 0; text-align:center;">
                <a href="${safeApprovalUrl}" style="display:inline-block; padding:16px 24px; background:#020617; color:#ffffff; text-decoration:none; border-radius:14px; font-weight:700; font-size:16px;">
                  Freigabe öffnen
                </a>
              </div>

              <p style="margin:22px 0 0; color:#64748b; font-size:13px; line-height:1.6;">
                Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br />
                <a href="${safeApprovalUrl}" style="color:#0f172a; word-break:break-all;">${safeApprovalUrl}</a>
              </p>

              <div style="margin:24px 0 0; padding:16px; border-radius:14px; background:#fffbeb; color:#78350f; font-size:13px; line-height:1.6;">
                Bitte geben Sie die Arbeit über den Link frei oder senden Sie dort eine Rückfrage. So kann die Entscheidung eindeutig dem Auftrag zugeordnet und im Nachweis dokumentiert werden.
              </div>

              <div style="margin:24px 0 0; padding:18px; border-radius:16px; background:#f8fafc; border:1px solid #e2e8f0;">
                <p style="margin:0 0 8px; color:#64748b; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.04em;">
                  Betrieb
                </p>
                <p style="margin:0; font-size:15px; font-weight:700;">${safeCompanyName}</p>
                ${getSafeOptionalHtmlLine("Telefon", company.phone)}
                ${getSafeOptionalHtmlLine("E-Mail", company.email)}
                ${
                  safeCompanyAddress
                    ? `<p style="margin:8px 0 0; color:#475569; font-size:14px; line-height:1.6;">${safeCompanyAddress}</p>`
                    : ""
                }
              </div>
            </div>
          </div>

          <p style="margin:18px 0 0; text-align:center; color:#94a3b8; font-size:12px;">
            Gesendet mit ${safeAppName}.
          </p>
        </div>
      </div>
    `;

    const text = [
      `${APP_NAME}`,
      "",
      "Freigabe für Ihren Auftrag erforderlich",
      "",
      `Hallo ${customer.name},`,
      "",
      `${company.name} hat eine Zusatzarbeit zu Ihrem Auftrag dokumentiert.`,
      "Bitte öffnen Sie den folgenden Link und wählen Sie dort „Freigeben“ oder senden Sie eine Rückfrage.",
      "",
      `Auftrag: ${job.title}`,
      vehicleLine ? `Fahrzeug: ${vehicleLine}` : "",
      "",
      `Zusatzarbeit: ${item.title}`,
      item.description,
      item.priceText ? `Kostenschätzung: ${item.priceText}` : "",
      photoCount > 0
        ? `${photoCount} Foto${photoCount === 1 ? "" : "s"} zur Dokumentation hinterlegt.`
        : "",
      "",
      `Freigabe öffnen: ${approvalUrl}`,
      "",
      "Bitte geben Sie die Arbeit über den Link frei oder senden Sie dort eine Rückfrage. So kann die Entscheidung eindeutig dem Auftrag zugeordnet und im Nachweis dokumentiert werden.",
      "",
      "Betrieb:",
      company.name,
      company.phone ? `Telefon: ${company.phone}` : "",
      company.email ? `E-Mail: ${company.email}` : "",
      company.address ? company.address : "",
      "",
      `Gesendet mit ${APP_NAME}.`,
    ]
      .filter(Boolean)
      .join("\n");

    const emailPayload: {
      from: string;
      to: string;
      subject: string;
      html: string;
      text: string;
      replyTo?: string;
    } = {
      from: `${APP_NAME} <noreply@freigabeonline.de>`,
      to: customer.email,
      subject,
      html,
      text,
    };

    if (company.email) {
      emailPayload.replyTo = company.email;
    }

    const result = await resend.emails.send(emailPayload);

    if (result.error) {
      return NextResponse.json(
        {
          error:
            result.error.message || "E-Mail konnte nicht gesendet werden.",
        },
        { status: 500 }
      );
    }

    await prisma.approval.update({
      where: {
        id: approval.id,
      },
      data: {
        emailSentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Send approval email failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unbekannter Fehler beim E-Mail-Versand.";

    return NextResponse.json(
      { error: `E-Mail konnte nicht gesendet werden: ${message}` },
      { status: 500 }
    );
  }
}