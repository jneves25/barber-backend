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
exports.CompanyController = void 0;
const CompanyService_1 = require("./CompanyService");
const CompanyMemberService_1 = require("../company-member/CompanyMemberService");
const UserService_1 = require("../users/UserService");
const client_1 = require("@prisma/client");
const companyService = new CompanyService_1.CompanyService();
const userService = new UserService_1.UserService();
const companyMemberService = new CompanyMemberService_1.CompanyMemberService();
class CompanyController {
    static createCompany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, ownerId, address } = req.body;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const userData = yield userService.getUserById(userId);
                if (!userData) {
                    res.status(403).json({ message: "Usuário não encontrado" });
                    return;
                }
                if (userData.role !== client_1.RoleEnum.ADMIN) {
                    res.status(400).json({ message: "Apenas admininstradores podem criar uma empresa" });
                    return;
                }
                if (!name) {
                    throw new Error("É obrigatório enviar um nome para a empresa");
                }
                if (!ownerId) {
                    throw new Error("É obrigatório enviar um usuário para ser administrador da empresa");
                }
                if (!address) {
                    throw new Error("É obrigatório enviar um endereço para a empresa");
                }
                const company = yield companyService.createCompany({ name, ownerId, address });
                res.status(201).json(company);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(422).json({ message: error.message });
                }
                else {
                    res.status(400).json({ message: 'Erro inesperado ao criar time' });
                }
            }
        });
    }
    static getAllCompanys(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const companies = yield companyService.getCompanyByUserId(userId);
                res.status(200).json(companies);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao obter times', error });
            }
        });
    }
    static getCompanyById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const userData = yield userService.getUserById(userId);
                if (!userData) {
                    res.status(403).json({ message: "Usuário não encontrado" });
                    return;
                }
                if (userData.companies.some(company => company.id !== parseInt(id))) {
                    res.status(403).json({ message: "Você não possui permissão para visualizar esta empresa" });
                    return;
                }
                const company = yield companyService.getCompanyById(parseInt(id));
                if (company) {
                    res.status(200).json(company);
                }
                else {
                    res.status(404).json({ message: 'Time não encontrado' });
                }
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao obter time', error });
            }
        });
    }
    static addMemberToCompany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { CompanyId, userId } = req.body;
            try {
                const CompanyMember = yield companyMemberService.addMemberToCompany(CompanyId, userId);
                res.status(201).json(CompanyMember);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao adicionar membro ao time', error });
            }
        });
    }
    static getUserCompanys(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = parseInt(req.params.userId);
            try {
                const companies = yield companyService.getCompanyByUserId(userId);
                res.status(200).json(companies);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao obter times do usuário', error });
            }
        });
    }
    static updateCompany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const userId = req.userId;
            const updateData = req.body;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const userData = yield userService.getUserById(userId);
                if (!userData) {
                    res.status(403).json({ message: "Usuário não encontrado" });
                    return;
                }
                if (userData.companies.some(company => company.id !== parseInt(id))) {
                    res.status(403).json({ message: "Você não possui permissão para atualizar esta empresa" });
                    return;
                }
                const updatedCompany = yield companyService.updateCompany(parseInt(id), updateData);
                res.status(200).json(updatedCompany);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao atualizar empresa', error });
            }
        });
    }
    static getCompanyBySlug(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { slug } = req.params;
            try {
                if (!slug) {
                    res.status(400).json({ message: 'Slug da empresa é obrigatório' });
                    return;
                }
                const company = yield companyService.getCompanyBySlug(slug);
                if (!company) {
                    res.status(404).json({ message: 'Empresa não encontrada' });
                    return;
                }
                res.status(200).json(company);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao obter empresa pelo slug', error });
            }
        });
    }
}
exports.CompanyController = CompanyController;
