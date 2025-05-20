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
exports.ClientAppointmentController = void 0;
const ClientAppointmentService_1 = require("./ClientAppointmentService");
const client_1 = require("@prisma/client");
const ClientService_1 = require("../client/ClientService");
const clientAppointmentService = new ClientAppointmentService_1.ClientAppointmentService();
const clientService = new ClientService_1.ClientService();
class ClientAppointmentController {
    static createAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, userId, services, products, scheduledTime, customerPhone, customerName, customerEmail } = req.body;
            try {
                if (!customerPhone) {
                    res.status(422).json({ message: 'Telefone do cliente é obrigatório' });
                    return;
                }
                if (!companyId) {
                    res.status(422).json({ message: 'Empresa é obrigatório' });
                    return;
                }
                if (!userId) {
                    res.status(422).json({ message: 'Profissional é obrigatório' });
                    return;
                }
                // Parse scheduledTime to ensure it's a valid date, mas manter no UTC
                let parsedScheduledTime;
                try {
                    parsedScheduledTime = new Date(scheduledTime);
                    // Check if it's a valid date
                    if (isNaN(parsedScheduledTime.getTime())) {
                        throw new Error("Data inválida");
                    }
                    console.log("ClientController - Parsed scheduledTime (UTC):", parsedScheduledTime.toISOString());
                }
                catch (error) {
                    res.status(422).json({ message: 'Formato de data e hora inválido' });
                    return;
                }
                // Verificar se o cliente já existe pelo telefone
                let clientId;
                const existingClient = yield clientService.findClientByPhone(customerPhone);
                if (existingClient) {
                    clientId = existingClient.id;
                }
                else if (customerName) {
                    // Se o cliente não existe, criar um novo cliente
                    const newClient = yield clientService.createClientFromPortal({
                        name: customerName,
                        phone: customerPhone,
                        email: customerEmail || ''
                    });
                    clientId = newClient.id;
                }
                else {
                    res.status(422).json({ message: 'Nome do cliente é obrigatório para novos clientes' });
                    return;
                }
                const newAppointment = yield clientAppointmentService.createAppointment({
                    clientId,
                    userId,
                    companyId,
                    services,
                    products,
                    scheduledTime: parsedScheduledTime
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
    static getClientAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientId = req.clientId;
            try {
                if (!clientId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o cliente, por favor tente novamente mais tarde!' });
                    return;
                }
                const appointments = yield clientAppointmentService.getClientAppointments(clientId);
                res.status(200).json(appointments);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar agendamentos', error });
            }
        });
    }
    static getAppointmentById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const clientId = req.clientId;
            try {
                if (!clientId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o cliente, por favor tente novamente mais tarde!' });
                    return;
                }
                const appointment = yield clientAppointmentService.getClientAppointmentById(Number(id), clientId);
                if (!appointment) {
                    res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a este cliente' });
                    return;
                }
                res.status(200).json(appointment);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar agendamento', error });
            }
        });
    }
    static cancelAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const clientId = req.clientId;
            try {
                if (!clientId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o cliente, por favor tente novamente mais tarde!' });
                    return;
                }
                const appointment = yield clientAppointmentService.getClientAppointmentById(Number(id), clientId);
                if (!appointment) {
                    res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a este cliente' });
                    return;
                }
                const updatedAppointment = yield clientAppointmentService.updateAppointmentStatus(Number(id), client_1.AppointmentStatusEnum.CANCELED);
                res.status(200).json(updatedAppointment);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro ao cancelar agendamento', error });
                }
            }
        });
    }
    static deleteAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const clientId = req.clientId;
            try {
                if (!clientId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o cliente, por favor tente novamente mais tarde!' });
                    return;
                }
                const appointment = yield clientAppointmentService.getClientAppointmentById(Number(id), clientId);
                if (!appointment) {
                    res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a este cliente' });
                    return;
                }
                // Only allow deletion of pending appointments
                if (appointment.status !== client_1.AppointmentStatusEnum.PENDING) {
                    res.status(400).json({ message: 'Apenas agendamentos pendentes podem ser excluídos' });
                    return;
                }
                yield clientAppointmentService.deleteAppointment(Number(id));
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
}
exports.ClientAppointmentController = ClientAppointmentController;
