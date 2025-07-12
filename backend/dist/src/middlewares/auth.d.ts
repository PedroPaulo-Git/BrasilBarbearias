import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=auth.d.ts.map