import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
declare function createCheckoutPreference(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
declare function handleWebhook(req: Request, res: Response): Promise<void>;
declare function confirmPayment(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare const paymentController: {
    createCheckoutPreference: typeof createCheckoutPreference;
    handleWebhook: typeof handleWebhook;
    confirmPayment: typeof confirmPayment;
};
export {};
//# sourceMappingURL=paymentController.d.ts.map