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

  const { token } = await params;

  const approval = await prisma.approval.findUnique({
    where: {
      token,
    },
    include: {
      documentationItem: {
        include: {
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

  if (!customer.email) {
    return NextResponse.json(
      { error: "Für diesen Kunden ist keine E-Mail-Adresse hinterlegt." },
      { status: 400 }
    );
  }

  const approvalUrl = getPublicUrl(`/f/${token}`);
  const resend = new Resend(apiKey);

  const safeCustomerName = escapeHtml(customer.name);
  const safeCompanyName = escapeHtml(company.name);
  const safeJobTitle = escapeHtml(job.title);
  const safeItemTitle = escapeHtml(item.title);
  const safeDescription = escapeHtml(item.description).replaceAll("\n", "<br />");
  const safePriceText = item.priceText ? escapeHtml(item.priceText) : "";
  const safeVehicle = job.vehicle ? escapeHtml(job.vehicle) : "";
  const safeLicensePlate = job.licensePlate ? escapeHtml(job.licensePlate) : "";

  const vehicleLine =
    safeVehicle || safeLicensePlate
      ? `${safeVehicle}${safeVehicle && safeLicensePlate ? " · " : ""}${safeLicensePlate}`
      : "";

  const plainVehicleLine =
    job.vehicle || job.licensePlate
      ? `${job.vehicle ?? ""}${job.vehicle && job.licensePlate ? " · " : ""}${
          job.licensePlate ?? ""
        }`
      : "";

  const subject = `${company.name}: Freigabe für Zusatzarbeit erforderlich`;

  const html = `
    <div style="margin:0; padding:0; background:#f8fafc;">
      <div style="max-width:640px; margin:0 auto; padding:32px 16px; font-family:Arial, sans-serif; color:#0f172a;">
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:18px; padding:28px;">
          <p style="margin:0 0 12px; color:#64748b; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.06em;">
            ${APP_NAME}
          </p>

          <h1 style="margin:0; font-size:26px; line-height:1.25; color:#0f172a;">
            Bitte Zusatzarbeit prüfen und freigeben
          </h1>

          <p style="margin:20px 0 0; font-size:16px; line-height:1.7;">
            Hallo ${safeCustomerName},
          </p>

          <p style="margin:12px 0 0; font-size:16px; line-height:1.7;">
            ${safeCompanyName} bittet Sie um eine Online-Freigabe für eine zusätzliche Arbeit zu Ihrem Auftrag.
          </p>

          <div style="margin:24px 0 0; padding:18px; border-radius:14px; background:#f1f5f9;">
            <p style="margin:0 0 6px; color:#64748b; font-size:13px;">Auftrag</p>
            <p style="margin:0; font-size:16px; font-weight:700;">${safeJobTitle}</p>
            ${
              vehicleLine
                ? `<p style="margin:8px 0 0; color:#475569; font-size:14px;">${vehicleLine}</p>`
                : ""
            }
          </div>

          <div style="margin:16px 0 0; padding:18px; border:1px solid #e2e8f0; border-radius:14px;">
            <p style="margin:0 0 6px; color:#64748b; font-size:13px;">Zusatzarbeit</p>
            <p style="margin:0; font-size:16px; font-weight:700;">${safeItemTitle}</p>
            <p style="margin:12px 0 0; color:#475569; font-size:15px; line-height:1.7;">${safeDescription}</p>
            ${
              safePriceText
                ? `<p style="margin:14px 0 0; font-size:16px; font-weight:700;">Kostenschätzung: ${safePriceText}</p>`
                : ""
            }
          </div>

          <p style="margin:28px 0 0;">
            <a href="${approvalUrl}" style="display:inline-block; padding:15px 22px; background:#020617; color:#ffffff; text-decoration:none; border-radius:14px; font-weight:700;">
              Freigabe jetzt öffnen
            </a>
          </p>

          <p style="margin:22px 0 0; color:#64748b; font-size:13px; line-height:1.6;">
            Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br />
            <a href="${approvalUrl}" style="color:#0f172a;">${approvalUrl}</a>
          </p>

          <div style="margin:24px 0 0; padding:16px; border-radius:14px; background:#fffbeb; color:#78350f; font-size:13px; line-height:1.6;">
            Bei Fragen zur Arbeit, zum Preis oder zum Auftrag können Sie direkt auf diese E-Mail antworten.
            Ihre Antwort geht an ${safeCompanyName}.
          </div>
        </div>

        <p style="margin:18px 0 0; text-align:center; color:#94a3b8; font-size:12px;">
          Gesendet mit ${APP_NAME}.
        </p>
      </div>
    </div>
  `;

  const text = [
    `${APP_NAME}`,
    "",
    "Bitte Zusatzarbeit prüfen und freigeben",
    "",
    `Hallo ${customer.name},`,
    "",
    `${company.name} bittet Sie um eine Online-Freigabe für eine zusätzliche Arbeit zu Ihrem Auftrag.`,
    "",
    `Auftrag: ${job.title}`,
    plainVehicleLine ? `Fahrzeug: ${plainVehicleLine}` : "",
    "",
    `Zusatzarbeit: ${item.title}`,
    item.description,
    item.priceText ? `Kostenschätzung: ${item.priceText}` : "",
    "",
    `Freigabe öffnen: ${approvalUrl}`,
    "",
    `Bei Fragen zur Arbeit, zum Preis oder zum Auftrag können Sie direkt auf diese E-Mail antworten. Ihre Antwort geht an ${company.name}.`,
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
      { error: result.error.message || "E-Mail konnte nicht gesendet werden." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}