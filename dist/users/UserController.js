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
exports.UserController = void 0;
const UserService_1 = require("./UserService");
const CompanyService_1 = require("../company/CompanyService");
const CompanyMemberService_1 = require("../company-member/CompanyMemberService");
const PermissionService_1 = require("../permission/PermissionService");
const CommissionService_1 = require("../commission/CommissionService");
const GoalService_1 = require("../goal/GoalService");
const ServiceService_1 = require("../service/ServiceService");
const userService = new UserService_1.UserService();
const companyService = new CompanyService_1.CompanyService();
const companyMemberService = new CompanyMemberService_1.CompanyMemberService();
const permissionService = new PermissionService_1.PermissionService();
const commissionService = new CommissionService_1.CommissionService();
const goalService = new GoalService_1.GoalService();
const serviceService = new ServiceService_1.ServiceService();
class UserController {
    static createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, name, role, password, companyId } = req.body;
            const userId = req.userId || undefined;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                if (!companyId) {
                    res.status(404).json({ message: 'Empresa não informada' });
                    return;
                }
                const newUser = yield userService.createUserWithPermissions({ email, name, password, role });
                if (!newUser) {
                    res.status(400).json({ message: 'Falha ao cadastrar dados do usuário' });
                    return;
                }
                // Adiciona permissoes ao usuario de acordo com a role dele
                yield permissionService.assignPermissionsToUser(newUser.id, newUser.role, newUser.permissions);
                // Adiciona o usuario criado ao time do usuario admin
                yield companyMemberService.addMemberToCompany(companyId, newUser.id);
                // Cria a configuração padrão de comissão
                const commissionConfig = yield commissionService.createDefaultCommissionConfig(newUser.id, companyId);
                // Busca todos os serviços existentes
                const services = yield serviceService.getAllServices(companyId);
                // Cria uma regra de comissão para cada serviço
                for (const service of services) {
                    yield commissionService.createCommissionRule({
                        configId: commissionConfig.id,
                        serviceId: service.id,
                        serviceType: 'PERCENTAGE',
                        percentage: 40 // Valor padrão de 40%
                    });
                }
                // Add goals from current month until end of year
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth() + 1;
                const currentYear = currentDate.getFullYear();
                for (let month = currentMonth; month <= 12; month++) {
                    yield goalService.createGoal({
                        userId: newUser.id,
                        companyId: companyId,
                        month: month,
                        year: currentYear,
                        target: 0 // Default target value
                    });
                }
                res.status(201).json(newUser);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro inesperado ao criar usuário', error });
                }
            }
        });
    }
    static getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userService.getAllUsers();
                res.status(200).json(users);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar usuários', error });
            }
        });
    }
    static getUserInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const user = yield userService.getUserById(userId);
                if (user) {
                    res.status(200).json(user);
                }
                else {
                    res.status(404).json({ message: 'Usuário não encontrado' });
                }
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar usuário', error });
            }
        });
    }
    static getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                if (!id) {
                    res.status(400).json({ message: 'ID do usuário não fornecido!' });
                    return;
                }
                const loggedUser = yield userService.getUserById(userId);
                if (!loggedUser) {
                    res.status(404).json({ message: 'Usuário logado não encontrado!' });
                    return;
                }
                // Criando um Set para garantir que os IDs são únicos
                const allowedIdsToVisualize = new Set(loggedUser.companies.flatMap(company => company.members.map((member) => member.id)));
                // Adicionando o userId do usuário logado ao Set
                allowedIdsToVisualize.add(userId);
                // Verifica se o usuário logado pode visualizar o usuário solicitado
                if (!allowedIdsToVisualize.has(parseInt(id))) {
                    res.status(403).json({ message: 'Você não possui permissão para visualizar esse usuário!' });
                    return;
                }
                const user = yield userService.getUserById(parseInt(id));
                if (user) {
                    res.status(200).json(user);
                }
                else {
                    res.status(404).json({ message: 'Usuário não encontrado' });
                }
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar usuário', error });
            }
        });
    }
    static updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { email, name, password, role } = req.body;
            try {
                const updatedUser = yield UserService_1.UserService.updateUser(Number(id), { email, name, password, role });
                res.status(200).json(updatedUser);
            }
            catch (error) {
                console.error(error);
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro ao atualizar o usuário', error });
                }
            }
        });
    }
    static deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield UserService_1.UserService.deleteUser(Number(id));
                res.status(204).send();
            }
            catch (error) {
                console.error(error);
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro ao excluir usuário', error: error });
                }
            }
        });
    }
    static getUsersByCompany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId } = req.query;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                if (!companyId) {
                    res.status(400).json({ message: 'ID da empresa não fornecido!' });
                    return;
                }
                const companyIdNumber = parseInt(companyId);
                // Check if user has access to this company
                const isUserInCompany = yield userService.verifyIfUserBelongsToCompany(userId, companyIdNumber);
                if (!isUserInCompany) {
                    res.status(403).json({ message: 'Você não possui permissão para acessar usuários desta empresa!' });
                    return;
                }
                const users = yield userService.getUsersByCompany(companyIdNumber);
                res.status(200).json(users);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar usuários da empresa', error });
            }
        });
    }
}
exports.UserController = UserController;
