import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shopId, name, price, duration } = await request.json();
    
    if (!shopId || !name || price === undefined || duration === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify that the user owns this shop
    const shop = await prisma.shop.findFirst({
      where: { 
        id: shopId,
        ownerId: session.user.id 
      },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found or access denied" }, { status: 404 });
    }

    const service = await prisma.service.create({
      data: { shopId, name, price, duration },
    });
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Failed to create service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
