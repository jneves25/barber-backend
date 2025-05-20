import { Router } from 'express';
import { ClientAppointmentController } from './ClientAppointmentController';
import { authClientMiddleware } from '../middleware/authClientMiddleware';

const router = Router();

// Criar agendamento - agora não precisa mais de autenticação
router.post('/', ClientAppointmentController.createAppointment);

// Rotas que ainda precisam de autenticação
router.get('/', authClientMiddleware, ClientAppointmentController.getClientAppointments);
router.get('/:id', authClientMiddleware, ClientAppointmentController.getAppointmentById);
router.delete('/:id', authClientMiddleware, ClientAppointmentController.deleteAppointment);
router.delete('/:id/cancel', authClientMiddleware, ClientAppointmentController.cancelAppointment);

export default router;