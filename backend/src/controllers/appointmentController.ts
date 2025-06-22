import { Request, Response } from 'express';
import { apiService } from '../services/apiService';
import { AppointmentRequest, ApiResponse } from '../types';

export class AppointmentController {
  async createAppointment(req: Request, res: Response): Promise<void> {
    try {
      const appointmentData: AppointmentRequest = req.body;
      const response = await apiService.createAppointment(appointmentData);
      
      const result: ApiResponse = {
        success: true,
        data: response.data,
        message: 'Agendamento criado com sucesso'
      };
      
      res.status(201).json(result);
    } catch (error: any) {
      const result: ApiResponse = {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar agendamento'
      };
      
      res.status(error.response?.status || 500).json(result);
    }
  }
}

export const appointmentController = new AppointmentController(); 