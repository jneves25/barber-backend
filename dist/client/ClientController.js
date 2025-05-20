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
exports.ClientController = void 0;
const ClientService_1 = require("./ClientService");
const AppointmentService_1 = require("../appointment/AppointmentService");
const clientService = new ClientService_1.ClientService();
const appointmentService = new AppointmentService_1.AppointmentService();
class ClientController {
    // personal section \/
    static registerClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, phone, password } = req.body;
            try {
                const result = yield clientService.registerClient({ name, email, phone, password });
                res.status(201).json(result);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro inesperado ao registrar cliente', error });
                }
            }
        });
    }
    static loginClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                const result = yield clientService.loginClient(email, password);
                res.status(200).json(result);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro inesperado ao fazer login', error });
                }
            }
        });
    }
    static getClientInformation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientId = req.clientId;
            try {
                if (!clientId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const client = yield clientService.getClientById(clientId);
                if (!client) {
                    res.status(404).json({ message: 'Cliente não encontrado' });
                    return;
                }
                res.status(200).json(client);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar cliente', error });
            }
        });
    }
    static updateClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, email, phone, password } = req.body;
            const clientId = req.clientId;
            try {
                if (!clientId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                if (parseInt(id) !== clientId) {
                    res.status(404).json({ message: 'Você não pode alterar o cadastro de outro usuário sem permissões!' });
                    return;
                }
                const updatedClient = yield clientService.updateClient(Number(id), { name, email, phone, password });
                res.status(200).json(updatedClient);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro ao atualizar cliente', error });
                }
            }
        });
    }
    static deleteClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const clientId = req.clientId;
            try {
                if (!clientId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                if (parseInt(id) !== clientId) {
                    res.status(404).json({ message: 'Você não pode deletar o cadastro de outro usuário sem permissões!' });
                    return;
                }
                yield clientService.deleteClient(Number(id));
                res.status(204).send();
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro ao excluir cliente', error });
                }
            }
        });
    }
    // admin section \/
    static registerClientAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId } = req.query;
            const { name, email, phone } = req.body;
            try {
                if (!companyId) {
                    res.status(422).json({ message: 'É preciso enviar uma empresa ao cadastrar um cliente manualmente' });
                    return;
                }
                const result = yield clientService.registerClientAdmin({ name, email, phone, sourceRegister: Number(companyId) });
                res.status(201).json(result);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro inesperado ao registrar cliente', error });
                }
            }
        });
    }
    static getClientById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const client = yield clientService.getClientById(Number(id));
                if (!client) {
                    res.status(404).json({ message: 'Cliente não encontrado' });
                    return;
                }
                res.status(200).json(client);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar cliente', error });
            }
        });
    }
    static getClientsByBarber(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const clients = yield clientService.getClientsByBarber(userId);
                res.status(200).json(clients);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar clientes do barbeiro', error });
            }
        });
    }
    static getAllClientsByCompany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId } = req.query;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                if (!companyId) {
                    res.status(404).json({ message: 'Empresa não encontrada para este usuário' });
                    return;
                }
                const clients = yield clientService.getAllClientsByCompany(Number(companyId));
                res.status(200).json(clients);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar clientes', error });
            }
        });
    }
}
exports.ClientController = ClientController;
