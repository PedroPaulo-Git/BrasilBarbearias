import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:5000";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log(`${BACKEND_API_URL}/payments/confirm-payment`)
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_API_URL}/payments/confirm-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token.sub}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error forwarding confirm-payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 