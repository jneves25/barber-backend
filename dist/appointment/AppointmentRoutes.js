"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AppointmentController_1 = require("./AppointmentController");
const authAdminMiddleware_1 = require("../middleware/authAdminMiddleware");
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = (0, express_1.Router)();
// Admin routes
router.get('/available-time-slots', AppointmentController_1.AppointmentController.getAvailableTimeSlots);
router.post('/', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageAppointments'), AppointmentController_1.AppointmentController.createAppointment);
router.get('/barber', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewOwnAppointments'), AppointmentController_1.AppointmentController.getAppointmentsByBarber);
router.get('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageAppointments'), AppointmentController_1.AppointmentController.getAppointmentById);
router.get('/', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewAllAppointments'), AppointmentController_1.AppointmentController.getAllAppointments);
router.put('/:id/status', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageAppointments'), AppointmentController_1.AppointmentController.updateAppointmentStatus);
router.put('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageAppointments'), AppointmentController_1.AppointmentController.updateAppointment);
router.delete('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageAppointments'), AppointmentController_1.AppointmentController.deleteAppointment);
exports.default = router;
