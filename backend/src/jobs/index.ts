import cron from 'node-cron';
import { cancelOverdueSubscriptions } from '../services/subscriptionService';

/**
 * Schedules the job to cancel overdue subscriptions.
 * The job is set to run once every day at midnight.
 */
export const scheduleSubscriptionJobs = () => {
  // Schedule to run every day at midnight '0 0 * * *'
  cron.schedule('0 0 * * *', () => {
    console.log('-------------------------------------');
    console.log('Starting scheduled subscription check...');
    cancelOverdueSubscriptions();
    console.log('Scheduled subscription check finished.');
    console.log('-------------------------------------');
  });

  console.log('Subscription jobs scheduled.');
  console.log("MERCADO_PAGO_ACCESS_TOKEN =>", process.env.MERCADO_PAGO_ACCESS_TOKEN);

}; 