import { PrismaClient } from '@prisma/client';
import { subDays } from 'date-fns';
// import { prisma } from '../../prisma/client';

const prismaClient = new PrismaClient();

/**
 * Cancels subscriptions that are active but have a payment that is more than 30 days overdue.
 * A subscription is considered overdue if its status is 'active' but its 'currentPeriodEnd'
 * date is more than 30 days in the past.
 */
export const cancelOverdueSubscriptions = async () => {
  console.log('Running job: cancelOverdueSubscriptions...');

  const thirtyDaysAgo = subDays(new Date(), 30);

  // Find subscriptions that are active and have not been successfully renewed in 30 days.
  // This is determined by looking at the end of the current billing period.
  const overdueSubscriptions = await prismaClient.subscription.findMany({
    where: {
      status: 'active',
      currentPeriodEnd: {
        lt: thirtyDaysAgo, // Less than thirty days ago (i.e., more than 30 days in the past)
      },
    },
  });

  if (overdueSubscriptions.length === 0) {
    console.log('No overdue subscriptions found.');
    return;
  }

  console.log(`Found ${overdueSubscriptions.length} overdue subscriptions to cancel.`);

  for (const sub of overdueSubscriptions) {
    try {
      await prismaClient.subscription.update({
        where: { id: sub.id },
        data: { status: 'canceled' },
      });
      console.log(`Subscription ${sub.id} has been canceled.`);
    } catch (error) {
      console.error(`Failed to cancel subscription ${sub.id}:`, error);
    }
  }

  console.log('Finished job: cancelOverdueSubscriptions.');
};

// Helper para buscar o plano ativo do usuário
export async function getUserPlan(userId: string) {
  return prismaClient.subscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
    include: { plan: true },
  });
} 