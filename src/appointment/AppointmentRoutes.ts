import { Router } from 'express';
import { AppointmentController } from './AppointmentController';
import { authAdminMiddleware } from '../middleware/authAdminMiddleware';
import { permissionMiddleware } from '../middleware/permissionMiddleware';

const router = Router();

// Admin routes
router.get('/available-time-slots', AppointmentController.getAvailableTimeSlots);
router.post('/', authAdminMiddleware, permissionMiddleware('manageAppointments'), AppointmentController.createAppointment);
router.get('/barber', authAdminMiddleware, permissionMiddleware('viewOwnAppointments'), AppointmentController.getAppointmentsByBarber);
router.get('/:id', authAdminMiddleware, permissionMiddleware('manageAppointments'), AppointmentController.getAppointmentById);
router.get('/', authAdminMiddleware, permissionMiddleware('viewAllAppointments'), AppointmentController.getAllAppointments);
router.put('/:id/status', authAdminMiddleware, permissionMiddleware('manageAppointments'), AppointmentController.updateAppointmentStatus);
router.put('/:id', authAdminMiddleware, permissionMiddleware('manageAppointments'), AppointmentController.updateAppointment);
router.delete('/:id', authAdminMiddleware, permissionMiddleware('manageAppointments'), AppointmentController.deleteAppointment);

export default router; 