export declare const cancelOverdueSubscriptions: () => Promise<void>;
export declare function getUserPlan(userId: string): Promise<({
    plan: {
        id: string;
        name: string;
        createdAt: Date;
        price: number;
        shopLimit: number;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    planId: string;
    status: string;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    mercadoPagoSubscriptionId: string | null;
    mercadoPagoPreferenceId: string | null;
    mercadoPagoPaymentId: string | null;
}) | null>;
//# sourceMappingURL=subscriptionService.d.ts.map