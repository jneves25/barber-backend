"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ClientAppointmentController_1 = require("./ClientAppointmentController");
const authClientMiddleware_1 = require("../middleware/authClientMiddleware");
const router = (0, express_1.Router)();
// Criar agendamento - agora não precisa mais de autenticação
router.post('/', ClientAppointmentController_1.ClientAppointmentController.createAppointment);
// Rotas que ainda precisam de autenticação
router.get('/', authClientMiddleware_1.authClientMiddleware, ClientAppointmentController_1.ClientAppointmentController.getClientAppointments);
router.get('/:id', authClientMiddleware_1.authClientMiddleware, ClientAppointmentController_1.ClientAppointmentController.getAppointmentById);
router.delete('/:id', authClientMiddleware_1.authClientMiddleware, ClientAppointmentController_1.ClientAppointmentController.deleteAppointment);
router.delete('/:id/cancel', authClientMiddleware_1.authClientMiddleware, ClientAppointmentController_1.ClientAppointmentController.cancelAppointment);
exports.default = router;
