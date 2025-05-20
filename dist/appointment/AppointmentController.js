"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const AppointmentService_1 = require("./AppointmentService");
const client_1 = require("@prisma/client");
const appointmentService = new AppointmentService_1.AppointmentService();
class AppointmentController {
    static createAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.userId;
            const { clientId, userId, companyId, services, products, scheduledTime } = req.body;
            try {
                if (!user) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                if (!userId) {
                    res.status(422).json({ message: 'Profissional é obrigatório' });
                    return;
                }
                if (!clientId) {
                    res.status(422).json({ message: 'Cliente é obrigatório' });
                    return;
                }
                if (!companyId) {
                    res.status(422).json({ message: 'Empresa é obrigatório' });
                    return;
                }
                if (!scheduledTime) {
                    res.status(422).json({ message: 'Data e hora do agendamento é obrigatório' });
                    return;
                }
                console.log("Controller received scheduledTime:", scheduledTime);
                // Parse scheduledTime to ensure it's a valid date, mas manter no UTC
                let parsedScheduledTime;
                try {
                    parsedScheduledTime = new Date(scheduledTime);
                    // Check if it's a valid date
                    if (isNaN(parsedScheduledTime.getTime())) {
                        throw new Error("Data inválida");
                    }
                    console.log("Parsed scheduledTime (UTC):", parsedScheduledTime.toISOString());
                }
                catch (error) {
                    res.status(422).json({ message: 'Formato de data e hora inválido' });
                    return;
                }
                const newAppointment = yield appointmentService.createAppointment({
                    clientId,
                    userId,
                    companyId,
                    services,
                    products,
                    scheduledTime: parsedScheduledTime // Enviar diretamente como UTC
                });
                res.status(201).json(newAppointment);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro inesperado ao criar agendamento', error });
                }
            }
        });
    }
    static getAppointmentById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const appointment = yield appointmentService.getAppointmentById(Number(id));
                if (!appointment) {
                    res.status(404).json({ message: 'Agendamento não encontrado' });
                    return;
                }
                res.status(200).json(appointment);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar agendamento', error });
            }
        });
    }
    static getAllAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, date } = req.query;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                if (!companyId) {
                    res.status(400).json({ message: 'ID da empresa é obrigatório' });
                    return;
                }
                // Se a data for fornecida, buscar agendamentos filtrados por data
                if (date) {
                    const appointments = yield appointmentService.getAppointmentsByDate(Number(companyId), date);
                    res.status(200).json(appointments);
                }
                else {
                    // Caso contrário, buscar todos os agendamentos
                    const appointments = yield appointmentService.getAllAppointments(Number(companyId));
                    res.status(200).json(appointments);
                }
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar agendamentos', error });
            }
        });
    }
    static getAppointmentsByBarber(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, date } = req.query;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                if (!companyId) {
                    res.status(400).json({ message: 'ID da empresa é obrigatório' });
                    return;
                }
                const appointments = yield appointmentService.getAppointmentsByBarber(userId, Number(companyId), date);
                res.status(200).json(appointments);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar agendamentos do barbeiro', error });
            }
        });
    }
    static updateAppointmentStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                if (!status || !Object.values(client_1.AppointmentStatusEnum).includes(status)) {
                    res.status(400).json({ message: 'Status inválido' });
                    return;
                }
                const updatedAppointment = yield appointmentService.updateAppointmentStatus(Number(id), status);
                res.status(200).json(updatedAppointment);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro ao atualizar status do agendamento', error });
                }
            }
        });
    }
    static deleteAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                yield appointmentService.deleteAppointment(Number(id));
                res.status(204).send();
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro ao excluir agendamento', error });
                }
            }
        });
    }
    static updateAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { services, products } = req.body;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                if (!services && !products) {
                    res.status(400).json({ message: 'É necessário informar pelo menos um serviço ou produto' });
                    return;
                }
                const updatedAppointment = yield appointmentService.updateAppointment(Number(id), {
                    services: services || [],
                    products: products || []
                });
                res.status(200).json(updatedAppointment);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro ao atualizar agendamento', error });
                }
            }
        });
    }
    static getAvailableTimeSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, companyId, date } = req.query;
            try {
                if (!userId || !companyId || !date) {
                    res.status(400).json({ message: 'UserId, CompanyId e Date são obrigatórios' });
                    return;
                }
                const availableTimeSlots = yield appointmentService.getAvailableTimeSlots(Number(userId), Number(companyId), date);
                res.status(200).json(availableTimeSlots);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro ao buscar horários disponíveis', error });
                }
            }
        });
    }
}
exports.AppointmentController = AppointmentController;
