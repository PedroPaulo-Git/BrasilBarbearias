"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopController = exports.ShopController = void 0;
const apiService_1 = require("../services/apiService");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ShopController {
    async getPublicShops(req, res) {
        try {
            const { search } = req.query;
            const response = await apiService_1.apiService.getPublicShops(search);
            const result = {
                success: true,
                data: response.data,
                message: 'Barbearias públicas listadas com sucesso'
            };
            res.json(result);
        }
        catch (error) {
            const result = {
                success: false,
                error: error.response?.data?.error || 'Erro ao listar barbearias públicas'
            };
            res.status(error.response?.status || 500).json(result);
        }
    }
    async getShopBySlug(req, res) {
        try {
            const { slug } = req.params;
            if (!slug) {
                res.status(400).json({ success: false, error: "Slug é obrigatório" });
                return;
            }
            const response = await apiService_1.apiService.getShopBySlug(slug);
            const result = {
                success: true,
                data: response.data,
                message: 'Barbearia encontrada com sucesso'
            };
            res.json(result);
        }
        catch (error) {
            const result = {
                success: false,
                error: error.response?.data?.error || 'Erro ao buscar barbearia'
            };
            res.status(error.response?.status || 500).json(result);
        }
    }
    async getAvailability(req, res) {
        try {
            const { slug } = req.params;
            const { date } = req.query;
            if (!slug) {
                res.status(400).json({ success: false, error: "Slug é obrigatório" });
                return;
            }
            if (!date || typeof date !== 'string') {
                const result = {
                    success: false,
                    error: 'Data é obrigatória'
                };
                res.status(400).json(result);
                return;
            }
            const response = await apiService_1.apiService.getAvailability(slug, date);
            const result = {
                success: true,
                data: response.data,
                message: 'Disponibilidade verificada com sucesso'
            };
            res.json(result);
        }
        catch (error) {
            const result = {
                success: false,
                error: error.response?.data?.error || 'Erro ao verificar disponibilidade'
            };
            res.status(error.response?.status || 500).json(result);
        }
    }
    async getUserShops(req, res) {
        try {
            if (!req.sessionToken) {
                const result = {
                    success: false,
                    error: 'Token de sessão necessário'
                };
                res.status(401).json(result);
                return;
            }
            const response = await apiService_1.apiService.getUserShops(req.sessionToken);
            const result = {
                success: true,
                data: response.data,
                message: 'Barbearias do usuário listadas com sucesso'
            };
            res.json(result);
        }
        catch (error) {
            const result = {
                success: false,
                error: error.response?.data?.error || 'Erro ao listar barbearias do usuário'
            };
            res.status(error.response?.status || 500).json(result);
        }
    }
    async createShop(req, res) {
        try {
            if (!req.sessionToken) {
                const result = {
                    success: false,
                    error: 'Token de sessão necessário'
                };
                res.status(401).json(result);
                return;
            }
            const shopData = req.body;
            const response = await apiService_1.apiService.createShop(shopData, req.sessionToken);
            const result = {
                success: true,
                data: response.data,
                message: 'Barbearia criada com sucesso'
            };
            res.status(201).json(result);
        }
        catch (error) {
            const result = {
                success: false,
                error: error.response?.data?.error || 'Erro ao criar barbearia'
            };
            res.status(error.response?.status || 500).json(result);
        }
    }
    async getBlockedTimes(req, res) {
        try {
            const { shopId } = req.params;
            if (!shopId) {
                res.status(400).json({ success: false, error: 'shopId é obrigatório' });
                return;
            }
            const shop = await prisma.shop.findUnique({ where: { id: shopId } });
            if (!shop || shop.ownerId !== req.user?.id) {
                res.status(403).json({ success: false, error: 'Acesso negado' });
                return;
            }
            const blockedTimes = await prisma.blockedTime.findMany({ where: { shopId } });
            res.json({ success: true, data: blockedTimes });
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao buscar horários bloqueados' });
        }
    }
    async createBlockedTime(req, res) {
        try {
            const { shopId } = req.params;
            const { date, startTime, endTime } = req.body;
            if (!shopId || !date || !startTime || !endTime) {
                res.status(400).json({ success: false, error: 'Dados obrigatórios ausentes' });
                return;
            }
            if (endTime <= startTime) {
                res.status(400).json({ success: false, error: 'Horário final deve ser após o inicial.' });
                return;
            }
            const shop = await prisma.shop.findUnique({ where: { id: shopId } });
            if (!shop || shop.ownerId !== req.user?.id) {
                res.status(403).json({ success: false, error: 'Acesso negado' });
                return;
            }
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
            let maxBlocks = 2;
            if (subscription.plan.name === 'Intermediário')
                maxBlocks = 10;
            if (subscription.plan.name === 'Avançado')
                maxBlocks = 100;
            const activeBlocks = await prisma.blockedTime.count({ where: { shopId } });
            if (activeBlocks >= maxBlocks) {
                res.status(403).json({ success: false, error: `Limite de bloqueios atingido para seu plano (${maxBlocks})` });
                return;
            }
            if (subscription.plan.name === 'Básico') {
                if (startTime >= shop.openTime && endTime <= shop.closeTime) {
                    res.status(403).json({ success: false, error: 'No plano Básico só é possível bloquear horários fora do expediente.' });
                    return;
                }
            }
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
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao criar horário bloqueado' });
        }
    }
    async deleteBlockedTime(req, res) {
        try {
            const { shopId, id } = req.params;
            if (!shopId || !id) {
                res.status(400).json({ success: false, error: 'shopId e id são obrigatórios' });
                return;
            }
            const shop = await prisma.shop.findUnique({ where: { id: shopId } });
            if (!shop || shop.ownerId !== req.user?.id) {
                res.status(403).json({ success: false, error: 'Acesso negado' });
                return;
            }
            await prisma.blockedTime.delete({ where: { id } });
            res.json({ success: true });
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Erro ao remover horário bloqueado' });
        }
    }
}
exports.ShopController = ShopController;
exports.shopController = new ShopController();
//# sourceMappingURL=shopController.js.map