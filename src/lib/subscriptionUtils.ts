import { prisma } from "@/lib/prisma";
import { Subscription } from "@prisma/client";

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  return await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: true,
    },
  });

  if (!user) return false;
  if (user.isAdmin) return true;

  const sub = user.subscriptions?.[0];
  if (!sub) return false;

  const now = new Date();
  return sub.status === "active" && sub.currentPeriodEnd && sub.currentPeriodEnd > now;
}

export async function canCreateShop(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscriptions: { include: { plan: true } }, shops: true },
  });
  if (!user) return false;
  if (user.isAdmin) return true;

  const sub = user.subscriptions?.[0];
  if (!sub) return false;

  const now = new Date();
  const active = sub.status === "active" && sub.currentPeriodEnd && sub.currentPeriodEnd > now;

  if (!active) return false;

  const shopLimit = sub.plan.shopLimit;
  return user.shops.length < shopLimit;
} 