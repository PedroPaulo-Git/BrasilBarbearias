import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class ShopController {
    getPublicShops(req: Request, res: Response): Promise<void>;
    getShopBySlug(req: Request, res: Response): Promise<void>;
    getAvailability(req: Request, res: Response): Promise<void>;
    getUserShops(req: AuthenticatedRequest, res: Response): Promise<void>;
    createShop(req: AuthenticatedRequest, res: Response): Promise<void>;
    getBlockedTimes(req: AuthenticatedRequest, res: Response): Promise<void>;
    createBlockedTime(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteBlockedTime(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const shopController: ShopController;
//# sourceMappingURL=shopController.d.ts.map