import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});
const preference = new Preference(client);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;
  const session = await getServerSession(authOptions);
  const userEmail = (session as { user?: { email?: string } })?.user?.email;
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const plan = await prisma.plan.findFirst({
    where: {
      OR: [
        { id: planId },
        { name: { equals: planId, mode: "insensitive" } },
      ],
    },
  });
  if (!plan) return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });

  const prefBody = {
    items: [
      {
        id: plan.id,
        title: `Assinatura Plano ${plan.name}`,
        quantity: 1,
        currency_id: "BRL",
        unit_price: plan.price,
      },
    ],
    payer: { email: user.email },
    back_urls: {
      success: `${process.env.BASE_URL}/dashboard?payment=success`,
      failure: `${process.env.BASE_URL}/dashboard?payment=failure`,
      pending: `${process.env.BASE_URL}/dashboard?payment=pending`,
    },
    auto_return: "approved",
    notification_url: `${process.env.BASE_URL}/api/webhook/mercadopago?secret=${process.env.MERCADO_PAGO_WEBHOOK_SECRET}`,
  };

  const prefResult = await preference.create({ body: prefBody });

  // (Opcional) Salve o preferenceId na subscription
  await prisma.subscription.updateMany({
    where: { userId: user.id },
    data: { mercadoPagoPreferenceId: prefResult.id },
  });

  return NextResponse.json({ init_point: prefResult.init_point });
} 