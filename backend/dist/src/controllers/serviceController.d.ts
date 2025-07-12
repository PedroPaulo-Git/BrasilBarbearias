import { Request, Response } from 'express';
export declare const createService: (req: Request, res: Response) => Promise<void>;
export declare const getServices: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateService: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteService: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=serviceController.d.ts.map