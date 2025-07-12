export declare function createPreference({ plan, user, backUrls, notificationUrl, externalReference, }: {
    plan: {
        id: string;
        name: string;
        price: number;
    };
    user: {
        email: string;
        name: string | null;
        surname?: string;
        phone?: {
            area_code: string;
            number: string;
        };
        identification?: {
            type: string;
            number: string;
        };
        address?: {
            street_name: string;
            street_number: number;
            zip_code: string;
        };
    };
    backUrls?: {
        success: string;
        failure: string;
        pending: string;
    };
    notificationUrl: string;
    externalReference: string;
}): Promise<import("mercadopago/dist/clients/preference/commonTypes").PreferenceResponse>;
export declare function getPayment(paymentId: string): Promise<import("mercadopago/dist/clients/payment/commonTypes").PaymentResponse>;
export declare function createDirectPayment({ plan, token, userEmail, paymentMethodId, issuerId, externalReference, payer, installments, }: {
    plan: any;
    token: string;
    userEmail: string;
    paymentMethodId?: string;
    issuerId?: string | number;
    externalReference: string;
    payer: {
        email: string;
        identification: {
            type: string;
            number: string;
        };
    };
    installments: number;
}): Promise<any>;
//# sourceMappingURL=mercadoPagoService.d.ts.map