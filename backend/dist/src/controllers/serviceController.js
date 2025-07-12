"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.getServices = exports.createService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createService = async (req, res) => {
    const { shopId, name, price, duration } = req.body;
    try {
        const service = await prisma.service.create({
            data: { shopId, name, price, duration },
        });
        res.status(201).json(service);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create service' });
    }
};
exports.createService = createService;
const getServices = async (req, res) => {
    const { shopId } = req.params;
    if (!shopId) {
        return res.status(400).json({ error: 'Shop ID is required' });
    }
    try {
        const services = await prisma.service.findMany({ where: { shopId } });
        return res.json(services);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch services' });
    }
};
exports.getServices = getServices;
const updateService = async (req, res) => {
    const { id } = req.params;
    const { name, price, duration } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'Service ID is required' });
    }
    try {
        const service = await prisma.service.update({
            where: { id },
            data: { name, price, duration },
        });
        return res.json(service);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update service' });
    }
};
exports.updateService = updateService;
const deleteService = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'Service ID is required' });
    }
    try {
        await prisma.service.delete({ where: { id } });
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete service' });
    }
};
exports.deleteService = deleteService;
//# sourceMappingURL=serviceController.js.map