import { getServerSession } from "next-auth/next";
import type { Session, User } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

type CustomSession = Session & {
  user: User & {
    id: string;
  };
};

export async function GET() {
  const session = (await getServerSession(authOptions)) as CustomSession | null;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscriptions: { include: { plan: true } } },
    });

    const sub: any = user?.subscriptions?.[0];
    if (!sub) {
      return NextResponse.json({ name: "Nenhum plano", status: "sem assinatura" });
    }

    return NextResponse.json({
      name: sub.plan.name,
      status: sub.status,
      trialEnd: sub.trialEnd,
      paymentEnd: sub.currentPeriodEnd,
      shopLimit: sub.plan.shopLimit,
    });
  } catch (error: any) {
    console.error("ERRO NA ROTA /api/user/subscribe:", error);
    // Retornar um erro mais detalhado para o frontend no log
    return new NextResponse(
      JSON.stringify({
        error: "Erro ao buscar dados da assinatura.",
        details: error.message,
      }),
      { status: 500 }
    );
  }
} 