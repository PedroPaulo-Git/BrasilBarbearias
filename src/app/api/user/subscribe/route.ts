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
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" }, // pega a assinatura mais recente primeiro
          include: { plan: true },
        },
      },
    });
    
    if (!user || !user.subscriptions || user.subscriptions.length === 0) {
      return NextResponse.json({ name: "Nenhum plano", status: "sem assinatura" });
    }
    console.log(user)
    // const sub: any = user?.subscriptions?.[0];
    // if (!sub || !sub.plan) {
    //   return NextResponse.json({ name: "Nenhum plano", status: "sem assinatura" });
    // }
    const activeSub = user.subscriptions.find(s => 
      s.status === 'active' &&
      (!s.currentPeriodEnd || new Date(s.currentPeriodEnd) > new Date()) &&
      s.plan
    );
    const pendingSub = user.subscriptions.find(s => 
      s.status === 'pending' &&
      s.plan
    );
    // const sub = user.subscriptions.find(s => {
    //   const isValidStatus = ['active', 'pending'].includes(s.status);
    //   const notExpired = !s.currentPeriodEnd || new Date(s.currentPeriodEnd) > new Date();
    //   const hasPlan = !!s.plan?.price;
    const sub = activeSub || pendingSub;

    console.log('sub ->', sub)
    if (!sub) {
      return NextResponse.json({ name: "Nenhum plano ativo", status: "sem assinatura" });
    }
    console.log('sub ->', sub)
    return NextResponse.json({
      id: sub.id,
      name: sub.plan.name,
      status: sub.status,
      price: sub.plan.price,
      paymentEnd: sub.currentPeriodEnd,
      paymentStart: sub.currentPeriodStart,
      planId: sub.planId,
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