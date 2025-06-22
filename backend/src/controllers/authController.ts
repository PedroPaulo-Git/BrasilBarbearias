import { Request, Response } from 'express';
import { apiService } from '../services/apiService';
import { RegisterRequest, ApiResponse } from '../types';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: RegisterRequest = req.body;
      const response = await apiService.register(userData);
      
      const result: ApiResponse = {
        success: true,
        data: response.data,
        message: 'Usuário registrado com sucesso'
      };
      console.log(result);
      res.status(201).json(result);
    } catch (error: any) {
      console.log(error);
      const result: ApiResponse = {
        success: false,
        error: error.response?.data?.error || 'Erro ao registrar usuário'
      };
      
      res.status(error.response?.status || 500).json(result);
    }
  }
}

export const authController = new AuthController(); 