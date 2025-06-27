// app/api/user/can-create-shop/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";
import { canCreateShop } from "@/lib/subscriptionUtils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ canCreate: false }, { status: 401 });

  const canCreate = await canCreateShop(session.user.id);
  return NextResponse.json({ canCreate });
}