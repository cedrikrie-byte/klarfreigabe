import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const confirmResetSchema = z.object({
  token: z.string().min(10, "Token fehlt."),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = confirmResetSchema.parse(body);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        token: data.token,
      },
      include: {
        user: true,
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Dieser Link ist ungültig oder abgelaufen." },
        { status: 400 }
      );
    }

    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: "Dieser Link wurde bereits verwendet." },
        { status: 400 }
      );
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Dieser Link ist abgelaufen. Bitte fordere einen neuen Link an." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          passwordHash,
        },
      }),

      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),

      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          id: {
            not: resetToken.id,
          },
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      }),
    ]);

    const cookieStore = await cookies();

    cookieStore.set("klarfreigabe_user_id", resetToken.userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Password reset confirm failed:", error);

    return NextResponse.json(
      { error: "Passwort konnte nicht zurückgesetzt werden." },
      { status: 400 }
    );
  }
}