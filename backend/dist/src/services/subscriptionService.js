"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOverdueSubscriptions = void 0;
exports.getUserPlan = getUserPlan;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prismaClient = new client_1.PrismaClient();
const cancelOverdueSubscriptions = async () => {
    console.log('Running job: cancelOverdueSubscriptions...');
    const thirtyDaysAgo = (0, date_fns_1.subDays)(new Date(), 30);
    const overdueSubscriptions = await prismaClient.subscription.findMany({
        where: {
            status: 'active',
            currentPeriodEnd: {
                lt: thirtyDaysAgo,
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
        }
        catch (error) {
            console.error(`Failed to cancel subscription ${sub.id}:`, error);
        }
    }
    console.log('Finished job: cancelOverdueSubscriptions.');
};
exports.cancelOverdueSubscriptions = cancelOverdueSubscriptions;
async function getUserPlan(userId) {
    return prismaClient.subscription.findFirst({
        where: {
            userId,
            status: 'active',
        },
        include: { plan: true },
    });
}
//# sourceMappingURL=subscriptionService.js.map