import { prisma } from "@/lib/prisma";

// Define Subscription type locally since it's not exported from Prisma client
type Subscription = {
  id: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  plan?: {
    id: string;
    name: string;
    price: number;
    shopLimit: number;
  };
};


// useEffect(() => {
//   fetch("/api/user/can-create-shop")
//     .then(res => res.json())
//     .then(data => {
//       console.log("[Dashboard] canCreateShop:", data.canCreate);
//       setCanCreateShopAllowed(data.canCreate);
//     })
//     .catch(err => {
//       console.error("Erro ao verificar permissão de criação:", err);
//     });
// }, []);

export async function getUserSubscription(
  userId: string
): Promise<Subscription | null> {
  console.log("[getUserSubscription] userId:", userId);
  const sub = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });
  console.log("[getUserSubscription] result:", sub);
  return sub as any;
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await getUserSubscription(userId);
  const now = new Date();

  const isActive =
    !!sub &&
    sub.status === "active" &&
    (!sub.currentPeriodEnd || sub.currentPeriodEnd > now);
  console.log(`[hasActiveSubscription] userId: ${userId}, active: ${isActive}`);
  return isActive;
}

export async function canCreateShop(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      shops: true,
      subscriptions: {
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        include: { plan: true },
      },
    },
  });

  if (!user) {
    console.log("[canCreateShop] user not found");
    return false;
  }
  if (user.isAdmin) return true;

  const sub = user.subscriptions.find((s: any) => s.status === 'active');
  const now = new Date();
  
  if (!sub || !(sub.currentPeriodEnd && sub.currentPeriodEnd > now)) {
    console.log("[canCreateShop] Nenhuma assinatura ativa e válida encontrada.");
    return false;
  }
  
  const shopLimit = sub.plan?.shopLimit ?? 0;
  const canCreate = user.shops.length < shopLimit;
  console.log(
    `[canCreateShop] user: ${userId}, shops: ${user.shops.length}/${shopLimit}, canCreate: ${canCreate}`
  );

  return canCreate;
}
