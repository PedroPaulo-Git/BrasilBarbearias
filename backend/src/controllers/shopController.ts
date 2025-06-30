import { Request, Response } from 'express';
import { apiService } from '../services/apiService';
import { AuthenticatedRequest, ShopRequest, ApiResponse, ShopQuery } from '../types';
// import { prisma } from '../../prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      if (!slug) {
        res.status(400).json({ success: false, error: "Slug é obrigatório" });
        return;
      }
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
      
      if (!slug) {
        res.status(400).json({ success: false, error: "Slug é obrigatório" });
        return;
      }
      
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

  // Listar horários bloqueados de uma shop
  async getBlockedTimes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;
      if (!shopId) {
        res.status(400).json({ success: false, error: 'shopId é obrigatório' });
        return;
      }
      // Verifica se o usuário é dono da shop
      const shop = await prisma.shop.findUnique({ where: { id: shopId } });
      if (!shop || shop.ownerId !== req.user?.id) {
        res.status(403).json({ success: false, error: 'Acesso negado' });
        return;
      }
      const blockedTimes = await prisma.blockedTime.findMany({ where: { shopId } });
      res.json({ success: true, data: blockedTimes });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Erro ao buscar horários bloqueados' });
    }
  }

  // Criar novo horário bloqueado
  async createBlockedTime(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;
      const { date, startTime, endTime } = req.body;
      if (!shopId || !date || !startTime || !endTime) {
        res.status(400).json({ success: false, error: 'Dados obrigatórios ausentes' });
        return;
      }
      // Validação de coerência temporal
      if (endTime <= startTime) {
        res.status(400).json({ success: false, error: 'Horário final deve ser após o inicial.' });
        return;
      }
      // Verifica se o usuário é dono da shop
      const shop = await prisma.shop.findUnique({ where: { id: shopId } });
      if (!shop || shop.ownerId !== req.user?.id) {
        res.status(403).json({ success: false, error: 'Acesso negado' });
        return;
      }
      // Verifica plano do usuário
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: req.user?.id,
          status: 'active',
        },
        include: { plan: true },
      });
      if (!subscription) {
        res.status(403).json({ success: false, error: 'Plano ativo necessário' });
        return;
      }
      // Limites por plano
      let maxBlocks = 2;
      if (subscription.plan.name === 'Intermediário') maxBlocks = 10;
      if (subscription.plan.name === 'Avançado') maxBlocks = 100;
      const activeBlocks = await prisma.blockedTime.count({ where: { shopId } });
      if (activeBlocks >= maxBlocks) {
        res.status(403).json({ success: false, error: `Limite de bloqueios atingido para seu plano (${maxBlocks})` });
        return;
      }
      // Exemplo de restrição extra para plano básico: só pode bloquear fora do expediente
      if (subscription.plan.name === 'Básico') {
        if (startTime >= shop.openTime && endTime <= shop.closeTime) {
          res.status(403).json({ success: false, error: 'No plano Básico só é possível bloquear horários fora do expediente.' });
          return;
        }
      }
      // Validação de sobreposição de bloqueios
      const overlapping = await prisma.blockedTime.findFirst({
        where: {
          shopId,
          date: new Date(date),
          OR: [
            {
              startTime: { lte: endTime },
              endTime: { gte: startTime }
            }
          ]
        }
      });
      if (overlapping) {
        res.status(400).json({ success: false, error: 'Já existe um bloqueio nesse intervalo.' });
        return;
      }
      const blockedTime = await prisma.blockedTime.create({
        data: { shopId, date: new Date(date), startTime, endTime },
      });
      res.status(201).json({ success: true, data: blockedTime });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Erro ao criar horário bloqueado' });
    }
  }

  // Remover horário bloqueado
  async deleteBlockedTime(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { shopId, id } = req.params;
      if (!shopId || !id) {
        res.status(400).json({ success: false, error: 'shopId e id são obrigatórios' });
        return;
      }
      // Verifica se o usuário é dono da shop
      const shop = await prisma.shop.findUnique({ where: { id: shopId } });
      if (!shop || shop.ownerId !== req.user?.id) {
        res.status(403).json({ success: false, error: 'Acesso negado' });
        return;
      }
      await prisma.blockedTime.delete({ where: { id } });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Erro ao remover horário bloqueado' });
    }
  }
}

export const shopController = new ShopController(); 