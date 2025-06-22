import { Request, Response } from 'express';
import { apiService } from '../services/apiService';
import { AuthenticatedRequest, ShopRequest, ApiResponse, ShopQuery } from '../types';

export class ShopController {
  async getPublicShops(req: Request, res: Response): Promise<void> {
    try {
      const { search } = req.query as ShopQuery;
      const response = await apiService.getPublicShops(search);
      
      const result: ApiResponse = {
        success: true,
        data: response.data,
        message: 'Barbearias públicas listadas com sucesso'
      };
      
      res.json(result);
    } catch (error: any) {
      const result: ApiResponse = {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar barbearias públicas'
      };
      
      res.status(error.response?.status || 500).json(result);
    }
  }

  async getShopBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const response = await apiService.getShopBySlug(slug);
      
      const result: ApiResponse = {
        success: true,
        data: response.data,
        message: 'Barbearia encontrada com sucesso'
      };
      
      res.json(result);
    } catch (error: any) {
      const result: ApiResponse = {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar barbearia'
      };
      
      res.status(error.response?.status || 500).json(result);
    }
  }

  async getAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const { date } = req.query;
      
      if (!date || typeof date !== 'string') {
        const result: ApiResponse = {
          success: false,
          error: 'Data é obrigatória'
        };
        res.status(400).json(result);
        return;
      }
      
      const response = await apiService.getAvailability(slug, date);
      
      const result: ApiResponse = {
        success: true,
        data: response.data,
        message: 'Disponibilidade verificada com sucesso'
      };
      
      res.json(result);
    } catch (error: any) {
      const result: ApiResponse = {
        success: false,
        error: error.response?.data?.error || 'Erro ao verificar disponibilidade'
      };
      
      res.status(error.response?.status || 500).json(result);
    }
  }

  async getUserShops(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.sessionToken) {
        const result: ApiResponse = {
          success: false,
          error: 'Token de sessão necessário'
        };
        res.status(401).json(result);
        return;
      }
      
      const response = await apiService.getUserShops(req.sessionToken);
      
      const result: ApiResponse = {
        success: true,
        data: response.data,
        message: 'Barbearias do usuário listadas com sucesso'
      };
      
      res.json(result);
    } catch (error: any) {
      const result: ApiResponse = {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar barbearias do usuário'
      };
      
      res.status(error.response?.status || 500).json(result);
    }
  }

  async createShop(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.sessionToken) {
        const result: ApiResponse = {
          success: false,
          error: 'Token de sessão necessário'
        };
        res.status(401).json(result);
        return;
      }
      
      const shopData: ShopRequest = req.body;
      const response = await apiService.createShop(shopData, req.sessionToken);
      
      const result: ApiResponse = {
        success: true,
        data: response.data,
        message: 'Barbearia criada com sucesso'
      };
      
      res.status(201).json(result);
    } catch (error: any) {
      const result: ApiResponse = {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar barbearia'
      };
      
      res.status(error.response?.status || 500).json(result);
    }
  }
}

export const shopController = new ShopController(); 