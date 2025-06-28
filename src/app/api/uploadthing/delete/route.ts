import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { UTApi } from "uploadthing/server";
import { authOptions } from "@/lib/authOptions";

const utapi = new UTApi();

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { keys } = await request.json();
  if (!keys || !Array.isArray(keys) || keys.length === 0) {
    return NextResponse.json({ error: "File keys are required" }, { status: 400 });
  }

  try {
    const result = await utapi.deleteFiles(keys);
    return NextResponse.json({ success: result.success });
  } catch (error) {
    console.error("Error deleting files from Uploadthing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 