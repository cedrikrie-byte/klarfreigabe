import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const createJobSchema = z.object({
  customerName: z.string().min(2, "Kundenname ist zu kurz."),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  licensePlate: z.string().optional(),
  vehicle: z.string().optional(),
  title: z.string().min(2, "Auftragstitel ist zu kurz."),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Nicht eingeloggt." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const data = createJobSchema.parse(body);

    const customer = await prisma.customer.create({
      data: {
        companyId: user.companyId,
        name: data.customerName,
        phone: data.customerPhone || null,
        email: data.customerEmail || null,
      },
    });

    const job = await prisma.job.create({
      data: {
        companyId: user.companyId,
        customerId: customer.id,
        title: data.title,
        licensePlate: data.licensePlate || null,
        vehicle: data.vehicle || null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Auftrag konnte nicht erstellt werden." },
      { status: 400 }
    );
  }
}