import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shopId } = await params;
    
    if (!shopId) {
      return NextResponse.json({ error: "Shop ID is required" }, { status: 400 });
    }

    // Verify that the user owns this shop
    const shop = await prisma.shop.findFirst({
      where: { 
        slug: shopId,
        ownerId: session.user.id 
      },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found or access denied" }, { status: 404 });
    }

    const services = await prisma.service.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: 'asc' }
    });
    
    return NextResponse.json({
      services,
      shopId: shop.id
    });
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
} 