import { Request, Response } from 'express';

// Tipos para requisições
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ShopRequest {
  name: string;
  description?: string;
  address: string;
  phone: string;
  slug: string;
}

export interface AppointmentRequest {
  shopId: string;
  serviceId: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

// Tipos para respostas
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos para queries
export interface ShopQuery {
  search?: string;
}

export interface AvailabilityQuery {
  date: string;
}

// Extensões do Express
export interface AuthenticatedRequest extends Request {
  sessionToken?: string;
  user?: {
    id: string;
    // adicione outros campos se necessário
  };
}

// Tipos para controllers
export interface Controller {
  register: (req: Request, res: Response) => Promise<void>;
  getPublicShops: (req: Request, res: Response) => Promise<void>;
  getShopBySlug: (req: Request, res: Response) => Promise<void>;
  getAvailability: (req: Request, res: Response) => Promise<void>;
  createAppointment: (req: Request, res: Response) => Promise<void>;
  getUserShops: (req: AuthenticatedRequest, res: Response) => Promise<void>;
  createShop: (req: AuthenticatedRequest, res: Response) => Promise<void>;
}

// Tipos para middlewares
export interface Middleware {
  auth: (req: AuthenticatedRequest, res: Response, next: Function) => void;
  errorHandler: (error: any, req: Request, res: Response, next: Function) => void;
} 