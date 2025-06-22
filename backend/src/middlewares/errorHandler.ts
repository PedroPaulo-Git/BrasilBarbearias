import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Erro:', error);
  
  const response: ApiResponse = {
    success: false,
    error: error.response?.data?.error || error.message || 'Erro interno do servidor'
  };
  
  res.status(error.response?.status || 500).json(response);
}; 