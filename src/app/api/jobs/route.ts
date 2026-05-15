import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const createJobSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  licensePlate: z.string().optional(),
  vehicle: z.string().optional(),
  title: z.string().min(2, "Auftragstitel ist zu kurz."),
  notes: z.string().optional(),
});

function getErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || "Eingaben sind ungültig.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Auftrag konnte nicht erstellt werden.";
}

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

    let customerId = data.customerId?.trim() || "";

    if (customerId) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          id: customerId,
          companyId: user.companyId,
        },
      });

      if (!existingCustomer) {
        return NextResponse.json(
          { error: "Kunde nicht gefunden." },
          { status: 404 }
        );
      }
    } else {
      const customerName = data.customerName?.trim() || "";

      if (customerName.length < 2) {
        return NextResponse.json(
          { error: "Kundenname ist zu kurz." },
          { status: 400 }
        );
      }

      const customer = await prisma.customer.create({
        data: {
          companyId: user.companyId,
          name: customerName,
          phone: data.customerPhone?.trim() || null,
          email: data.customerEmail?.trim().toLowerCase() || null,
        },
      });

      customerId = customer.id;
    }

    const job = await prisma.job.create({
      data: {
        companyId: user.companyId,
        customerId,
        title: data.title.trim(),
        licensePlate: data.licensePlate?.trim().toUpperCase() || null,
        vehicle: data.vehicle?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      customerId,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}