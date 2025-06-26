import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// O backend Express que lida com a lógica do Mercado Pago
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:5000";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { planId } = await req.json();
    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_API_URL}/payments/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token.sub}`,
      },
      body: JSON.stringify({ planId }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Checkout forward error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}