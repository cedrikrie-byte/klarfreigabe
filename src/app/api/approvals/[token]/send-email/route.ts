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

  const subject = `${company.name}: Bitte Zusatzarbeit freigeben`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin: 0 0 16px;">Freigabe erforderlich</h2>

      <p>Hallo ${customer.name},</p>

      <p>
        ${company.name} bittet um Ihre Freigabe für eine zusätzliche Arbeit.
      </p>

      <div style="margin: 24px 0; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
        <p style="margin: 0 0 8px; color: #64748b;">Auftrag</p>
        <p style="margin: 0; font-weight: 700;">${job.title}</p>
        ${
          job.vehicle || job.licensePlate
            ? `<p style="margin: 8px 0 0; color: #475569;">${job.vehicle ?? ""}${
                job.vehicle && job.licensePlate ? " · " : ""
              }${job.licensePlate ?? ""}</p>`
            : ""
        }
      </div>

      <div style="margin: 24px 0; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <p style="margin: 0 0 8px; color: #64748b;">Empfohlene Zusatzarbeit</p>
        <p style="margin: 0; font-weight: 700;">${item.title}</p>
        <p style="margin: 12px 0 0; color: #475569;">${item.description}</p>
        ${
          item.priceText
            ? `<p style="margin: 12px 0 0; font-weight: 700;">Kostenschätzung: ${item.priceText}</p>`
            : ""
        }
      </div>

      <p>
        <a href="${approvalUrl}" style="display: inline-block; padding: 14px 20px; background: #020617; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700;">
          Freigabe öffnen
        </a>
      </p>

      <p style="margin-top: 24px; color: #64748b; font-size: 13px;">
        Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br />
        <a href="${approvalUrl}">${approvalUrl}</a>
      </p>

      <p style="margin-top: 24px; color: #64748b; font-size: 13px;">
        Gesendet mit ${APP_NAME}.
      </p>
    </div>
  `;

  const text = [
    `Hallo ${customer.name},`,
    "",
    `${company.name} bittet um Ihre Freigabe für eine zusätzliche Arbeit.`,
    "",
    `Auftrag: ${job.title}`,
    job.vehicle || job.licensePlate
      ? `Fahrzeug: ${job.vehicle ?? ""}${
          job.vehicle && job.licensePlate ? " · " : ""
        }${job.licensePlate ?? ""}`
      : "",
    "",
    `Zusatzarbeit: ${item.title}`,
    item.description,
    item.priceText ? `Kostenschätzung: ${item.priceText}` : "",
    "",
    `Freigabe öffnen: ${approvalUrl}`,
    "",
    `Gesendet mit ${APP_NAME}.`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await resend.emails.send({
    from: `${APP_NAME} <onboarding@resend.dev>`,
    to: customer.email,
    subject,
    html,
    text,
  });

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