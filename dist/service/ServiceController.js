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
exports.ServiceController = void 0;
const ServiceService_1 = require("./ServiceService");
const UserService_1 = require("../users/UserService");
const CompanyMemberService_1 = require("../company-member/CompanyMemberService");
const CommissionService_1 = require("../commission/CommissionService");
const serviceService = new ServiceService_1.ServiceService();
const userService = new UserService_1.UserService();
const companyMemberService = new CompanyMemberService_1.CompanyMemberService();
const commissionService = new CommissionService_1.CommissionService();
class ServiceController {
    static createService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, price, duration, description, companyId } = req.body;
            const userId = req.userId;
            const parsedCompanyId = parseInt(companyId);
            try {
                const isCompanyValid = yield userService.verifyIfUserBelongsToCompany(userId, parsedCompanyId);
                if (!isCompanyValid) {
                    res.status(403).json({ message: 'Sem permissão para alterar dados dessa empresa' });
                    return;
                }
                const newService = yield serviceService.createService({
                    name,
                    price: parseFloat(price),
                    duration: parseInt(duration),
                    description,
                    companyId: parsedCompanyId
                });
                // Get all users from the company
                const companyUsers = yield companyMemberService.getMembersByCompanyId(parsedCompanyId);
                // For each user, get their commission config and create a rule
                for (const member of companyUsers) {
                    const userConfig = yield commissionService.getCommissionConfigByUserId(member.userId);
                    if (userConfig) {
                        yield commissionService.createCommissionRule({
                            configId: userConfig.id,
                            serviceId: newService.id,
                            serviceType: 'PERCENTAGE',
                            percentage: 40 // Default percentage
                        });
                    }
                }
                res.status(201).json(newService);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro inesperado ao criar serviço', error });
                }
            }
        });
    }
    static getAllServices(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId } = req.query;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                if (!companyId) {
                    res.status(422).json({ message: 'ID da empresa é obrigatório' });
                    return;
                }
                const isCompanyValid = yield userService.verifyIfUserBelongsToCompany(userId, Number(companyId));
                if (!isCompanyValid) {
                    res.status(403).json({ message: 'Sem permissão para acessar serviços desta empresa' });
                    return;
                }
                const services = yield serviceService.getAllServices(Number(companyId));
                res.status(200).json(services);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar serviços', error });
            }
        });
    }
    static getServiceById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const service = yield serviceService.getServiceById(Number(id));
                if (!service) {
                    res.status(404).json({ message: 'Serviço não encontrado' });
                    return;
                }
                const isCompanyValid = yield userService.verifyIfUserBelongsToCompany(userId, service.companyId);
                if (!isCompanyValid) {
                    res.status(403).json({ message: 'Sem permissão para acessar esse serviço' });
                    return;
                }
                res.status(200).json(service);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar serviço', error });
            }
        });
    }
    static updateService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, price, duration, description } = req.body;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const service = yield serviceService.getServiceById(Number(id));
                if (!service) {
                    res.status(404).json({ message: 'Serviço não encontrado' });
                    return;
                }
                const isCompanyValid = yield userService.verifyIfUserBelongsToCompany(userId, service.companyId);
                if (!isCompanyValid) {
                    res.status(403).json({ message: 'Sem permissão para acessar esse serviço' });
                    return;
                }
                const updatedService = yield serviceService.updateService(Number(id), {
                    name,
                    price: price ? parseFloat(price) : undefined,
                    duration: duration ? parseInt(duration) : undefined,
                    description
                });
                res.status(200).json(updatedService);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro ao atualizar serviço', error });
                }
            }
        });
    }
    static deleteService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const service = yield serviceService.getServiceById(Number(id));
                if (!service) {
                    res.status(404).json({ message: 'Serviço não encontrado' });
                    return;
                }
                const isCompanyValid = yield userService.verifyIfUserBelongsToCompany(userId, service.companyId);
                if (!isCompanyValid) {
                    res.status(403).json({ message: 'Sem permissão para acessar esse serviço' });
                    return;
                }
                yield serviceService.deleteService(Number(id));
                res.status(204).send();
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro ao excluir serviço', error });
                }
            }
        });
    }
    static getServicesByCompanySlug(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { slug } = req.params;
                if (!slug) {
                    res.status(400).json({ message: 'Slug da empresa é obrigatório' });
                    return;
                }
                const services = yield serviceService.getServicesByCompanySlug(slug);
                res.status(200).json(services);
            }
            catch (error) {
                console.error('Erro ao buscar serviços:', error);
                res.status(500).json({ message: 'Erro ao buscar serviços' });
            }
        });
    }
}
exports.ServiceController = ServiceController;
