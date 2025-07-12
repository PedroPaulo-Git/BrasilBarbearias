"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleSubscriptionJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const subscriptionService_1 = require("../services/subscriptionService");
const scheduleSubscriptionJobs = () => {
    node_cron_1.default.schedule('0 0 * * *', () => {
        console.log('-------------------------------------');
        console.log('Starting scheduled subscription check...');
        (0, subscriptionService_1.cancelOverdueSubscriptions)();
        console.log('Scheduled subscription check finished.');
        console.log('-------------------------------------');
    });
    console.log('Subscription jobs scheduled.');
    console.log("MERCADO_PAGO_ACCESS_TOKEN =>", process.env.MERCADO_PAGO_ACCESS_TOKEN);
};
exports.scheduleSubscriptionJobs = scheduleSubscriptionJobs;
//# sourceMappingURL=index.js.map