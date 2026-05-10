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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email.toLowerCase(),
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
        name: data.companyName,
        industry: "KFZ",
        email: data.email.toLowerCase(),
        users: {
          create: {
            name: data.name,
            email: data.email.toLowerCase(),
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
    console.error(error);

    return NextResponse.json(
      { error: "Registrierung fehlgeschlagen." },
      { status: 400 }
    );
  }
}