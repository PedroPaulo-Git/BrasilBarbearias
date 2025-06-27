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

    const plans = await prisma.plan.findMany({ 
        select: {
            id: true,
            name: true,
            price: true,
            shopLimit: true,
            createdAt: true,
        },
        orderBy: { price: 'asc' } 
    });
    
    const userSubscription = await prisma.subscription.findFirst({
        where: { 
            userId: session.user.id,
            status: 'active'
        },
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            planId: true,
            status: true,
            currentPeriodEnd: true,
            currentPeriodStart: true,
            plan: {
                select: {
                    name: true,
                    price: true,
                    shopLimit: true,
                }
            }
        }
    });

    return <PlansView plans={plans} userSubscription={userSubscription} />;
} 