import { prisma } from "@/lib/prisma";

export async function canCreateShop(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscriptions: { include: { plan: true } }, shops: true },
  });
  if (!user) return false;
  if (user.isAdmin) return true;

  const sub = user.subscriptions?.[0];
  if (!sub) return false;

  const now = new Date();
  const inTrial = sub.status === "trial" && sub.trialEnd > now;
  const active = sub.status === "active" && sub.paymentEnd && sub.paymentEnd > now;

  if (!(inTrial || active)) return false;

  const shopLimit = sub.plan.shopLimit;
  return user.shops.length < shopLimit;
} 