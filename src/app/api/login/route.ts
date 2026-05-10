import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse."),
  password: z.string().min(1, "Passwort fehlt."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email: data.email.toLowerCase(),
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "E-Mail oder Passwort ist falsch." },
        { status: 401 }
      );
    }

    const passwordIsValid = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    if (!passwordIsValid) {
      return NextResponse.json(
        { error: "E-Mail oder Passwort ist falsch." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();

cookieStore.set("klarfreigabe_user_id", user.id, {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});

return NextResponse.json({
  success: true,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    companyId: user.companyId,
    companyName: user.company.name,
  },
});
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Login fehlgeschlagen." },
      { status: 400 }
    );
  }
}