import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from '@/lib/prisma';
import { PlansView } from "./PlansView";
import type { Session, User } from "next-auth";

type CustomSession = Session & {
    user?: User & {
      id: string;
    };
};

export default async function PlansPage() {
    const session = (await getServerSession(authOptions)) as CustomSession | null;

    if (!session?.user?.id) {
        redirect('/auth/signin?callbackUrl=/plans');
    }

    const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } });
    
    const userSubscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
        select: {
            planId: true,
            status: true,
        }
    });

    return <PlansView plans={plans} userSubscription={userSubscription} />;
} 