import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const {
      date,
      startTime,
      endTime,
      recurring,
      recurrenceType,
      daysOfWeek,
    } = await request.json();

    const shop = await prisma.shop.findUnique({ where: { slug } });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const blockedTime = await prisma.blockedTime.create({
      data: {
        shopId: shop.id,
        date: date ? new Date(date) : null,
        startTime,
        endTime,
        recurring,
        recurrenceType,
        daysOfWeek,
      },
    });

    return NextResponse.json(blockedTime, { status: 201 });
  } catch (error) {
    console.error("Failed to create blocked time:", error);
    return NextResponse.json(
      { error: "Failed to create blocked time" },
      { status: 500 }
    );
  }
}
