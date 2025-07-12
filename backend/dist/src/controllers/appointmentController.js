"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentController = exports.AppointmentController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AppointmentController {
    async createAppointment(req, res) {
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
            const result = {
                success: true,
                data: appointment,
                message: 'Agendamento criado com sucesso'
            };
            res.status(201).json(result);
        }
        catch (error) {
            const result = {
                success: false,
                error: error.message || 'Erro ao criar agendamento'
            };
            res.status(500).json(result);
        }
    }
}
exports.AppointmentController = AppointmentController;
exports.appointmentController = new AppointmentController();
//# sourceMappingURL=appointmentController.js.map