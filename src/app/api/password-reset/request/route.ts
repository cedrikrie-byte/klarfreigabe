import { NextResponse } from "next/server";
import { Resend } from "resend";
import { nanoid } from "nanoid";
import { z } from "zod";
import { APP_NAME, getPublicUrl } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

const requestResetSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse."),
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY fehlt." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const data = requestResetSchema.parse(body);
    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        company: true,
      },
    });

    /*
      Aus Sicherheitsgründen geben wir immer success zurück,
      auch wenn die E-Mail nicht existiert.
      So kann niemand prüfen, welche E-Mail registriert ist.
    */
    if (!user) {
      return NextResponse.json({
        success: true,
      });
    }

    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        usedAt: new Date(),
      },
    });

    const token = nanoid(48);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetUrl = getPublicUrl(`/passwort-zuruecksetzen/${token}`);
    const resend = new Resend(apiKey);

    const safeAppName = escapeHtml(APP_NAME);
    const safeName = escapeHtml(user.name);
    const safeCompanyName = escapeHtml(user.company.name);
    const safeResetUrl = escapeHtml(resetUrl);

    const html = `
      <div style="margin:0; padding:0; background:#f8fafc;">
        <div style="max-width:640px; margin:0 auto; padding:32px 16px; font-family:Arial, sans-serif; color:#0f172a;">
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:20px; overflow:hidden;">
            <div style="padding:28px; background:#020617; color:#ffffff;">
              <p style="margin:0 0 12px; color:#cbd5e1; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.08em;">
                ${safeAppName}
              </p>

              <h1 style="margin:0; font-size:26px; line-height:1.25;">
                Passwort zurücksetzen
              </h1>

              <p style="margin:14px 0 0; color:#cbd5e1; font-size:15px; line-height:1.6;">
                Für ${safeCompanyName} wurde ein Link zum Zurücksetzen des Passworts angefordert.
              </p>
            </div>

            <div style="padding:28px;">
              <p style="margin:0; font-size:16px; line-height:1.7;">
                Hallo ${safeName},
              </p>

              <p style="margin:12px 0 0; font-size:16px; line-height:1.7;">
                über den folgenden Link kannst du ein neues Passwort für dein Konto festlegen.
              </p>

              <div style="margin:26px 0 0; text-align:center;">
                <a href="${safeResetUrl}" style="display:inline-block; padding:16px 24px; background:#020617; color:#ffffff; text-decoration:none; border-radius:14px; font-weight:700; font-size:16px;">
                  Neues Passwort festlegen
                </a>
              </div>

              <p style="margin:22px 0 0; color:#64748b; font-size:13px; line-height:1.6;">
                Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br />
                <a href="${safeResetUrl}" style="color:#0f172a; word-break:break-all;">${safeResetUrl}</a>
              </p>

              <div style="margin:24px 0 0; padding:16px; border-radius:14px; background:#fffbeb; color:#78350f; font-size:13px; line-height:1.6;">
                Dieser Link ist 30 Minuten gültig. Falls du kein neues Passwort angefordert hast, kannst du diese E-Mail ignorieren.
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
      "Passwort zurücksetzen",
      "",
      `Hallo ${user.name},`,
      "",
      `Für ${user.company.name} wurde ein Link zum Zurücksetzen des Passworts angefordert.`,
      "",
      `Neues Passwort festlegen: ${resetUrl}`,
      "",
      "Dieser Link ist 30 Minuten gültig.",
      "Falls du kein neues Passwort angefordert hast, kannst du diese E-Mail ignorieren.",
    ].join("\n");

    const result = await resend.emails.send({
      from: `${APP_NAME} <noreply@freigabeonline.de>`,
      to: user.email,
      subject: `Passwort zurücksetzen – ${APP_NAME}`,
      html,
      text,
    });

    if (result.error) {
      return NextResponse.json(
        {
          error:
            result.error.message ||
            "E-Mail zum Zurücksetzen konnte nicht gesendet werden.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Password reset request failed:", error);

    return NextResponse.json(
      { error: "Passwort-Zurücksetzen konnte nicht gestartet werden." },
      { status: 400 }
    );
  }
}