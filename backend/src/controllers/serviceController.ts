import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()
export const createService = async (req: Request, res: Response) => {
  const { shopId, name, price, duration } = req.body;
  try {
    const service = await prisma.service.create({
      data: { shopId, name, price, duration },
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
};

export const getServices = async (req: Request, res: Response) => {
  const { shopId } = req.params;
  
  if (!shopId) {
    return res.status(400).json({ error: 'Shop ID is required' });
  }
  
  try {
    const services = await prisma.service.findMany({ where: { shopId } });
    return res.json(services);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
};

export const updateService = async (req: Request, res: Response) => {
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
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update service' });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'Service ID is required' });
  }
  
  try {
    await prisma.service.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete service' });
  }
};
