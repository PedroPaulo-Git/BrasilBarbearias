import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTimeSlots } from "@/lib/utils";
import { getDay, parseISO } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Data é obrigatória" },
        { status: 400 }
      );
    }

    const shop = await prisma.shop.findUnique({
      where: { slug },
      include: { blockedTimes: true },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Barbearia não encontrada" },
        { status: 404 }
      );
    }

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const appointments = await prisma.appointment.findMany({
      where: {
        shopId: shop.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["confirmed", "completed"],
        },
      },
      select: {
        date: true,
      },
    });

    const bookedTimes = appointments.map((apt) => {
      const hours = apt.date.getUTCHours().toString().padStart(2, "0");
      const minutes = apt.date.getUTCMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    });

    const allTimeSlots = generateTimeSlots(
      shop.openTime,
      shop.closeTime,
      shop.serviceDuration
    );

    // New logic for blocked times
    const requestedDate = parseISO(date);
    const dayOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][getDay(requestedDate)];

    const blockedRanges = shop.blockedTimes
      .filter((block) => {
        if (!block.recurring) {
          // One-time block
          return (
            block.date &&
            new Date(block.date).toDateString() === requestedDate.toDateString()
          );
        }
        // Recurring block
        if (block.recurrenceType === "daily") return true;
        if (
          block.recurrenceType === "weekly" &&
          block.daysOfWeek.includes(dayOfWeek)
        ) {
          return true;
        }
        return false;
      })
      .map((block) => ({ start: block.startTime, end: block.endTime }));

    const availableSlots = allTimeSlots.filter((slot) => {
      if (bookedTimes.includes(slot)) return false;

      // Check if the slot is within a blocked range
      const slotDate = new Date(`${date}T${slot}:00`);
      for (const range of blockedRanges) {
        const start = new Date(`${date}T${range.start}:00`);
        const end = new Date(`${date}T${range.end}:00`);
        if (slotDate >= start && slotDate < end) {
          return false;
        }
      }

      return true;
    });

    return NextResponse.json({
      availableSlots,
      bookedTimes,
      shop: {
        id: shop.id,
        openTime: shop.openTime,
        closeTime: shop.closeTime,
        serviceDuration: shop.serviceDuration,
      },
    });
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 