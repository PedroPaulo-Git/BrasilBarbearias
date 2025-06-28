import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from '@/lib/prisma';
import { ProfileClient } from './ProfileClient'; // We will create this component

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/profile');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
    }
  });

  if (!user) {
    // This case should ideally not happen if a session exists
    redirect('/auth/signin');
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: 'active'
    },
    orderBy: { createdAt: 'desc' },
    include: { plan: true }
  });

  return <ProfileClient user={user} subscription={subscription} />;
} 