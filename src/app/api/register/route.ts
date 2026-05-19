import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  companyName: z.string().min(2, "Betriebsname ist zu kurz."),
  name: z.string().min(2, "Name ist zu kurz."),
  email: z.string().email("Ungültige E-Mail-Adresse."),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben."),
});

function getErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || "Registrierung fehlgeschlagen.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Registrierung fehlgeschlagen.";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const normalizedEmail = data.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Diese E-Mail ist bereits registriert." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const company = await prisma.company.create({
      data: {
        name: data.companyName.trim(),
        industry: "KFZ",
        email: normalizedEmail,
        users: {
          create: {
            name: data.name.trim(),
            email: normalizedEmail,
            passwordHash,
            role: "OWNER",
          },
        },
      },
      include: {
        users: true,
      },
    });

    return NextResponse.json({
      success: true,
      companyId: company.id,
      userId: company.users[0].id,
    });
  } catch (error) {
    console.error("Register failed:", error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}