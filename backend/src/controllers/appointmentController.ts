import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()
import { AppointmentRequest, ApiResponse } from '../types';

export class AppointmentController {
  async createAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { shopId, clientName, clientContact, date, selectedServices, haircutStyle } = req.body;

      const services = await prisma.service.findMany({
        where: { id: { in: selectedServices } },
      });

      if (services.length !== selectedServices.length) {
        res.status(400).json({ error: 'Invalid service ID' });
        return;
      }

      const appointmentData = {
        shopId,
        clientName,
        clientContact,
        date,
        selectedServices,
        haircutStyle,
      };

      const appointment = await prisma.appointment.create({ data: appointmentData });

      const result: ApiResponse = {
        success: true,
        data: appointment,
        message: 'Agendamento criado com sucesso'
      };

      res.status(201).json(result);
    } catch (error: any) {
      const result: ApiResponse = {
        success: false,
        error: error.message || 'Erro ao criar agendamento'
      };

      res.status(500).json(result);
    }
  }
}

export const appointmentController = new AppointmentController(); 