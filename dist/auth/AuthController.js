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
exports.AuthController = void 0;
const AuthService_1 = require("./AuthService");
const PermissionService_1 = require("../permission/PermissionService");
const CompanyService_1 = require("../company/CompanyService");
const CommissionService_1 = require("../commission/CommissionService");
const GoalService_1 = require("../goal/GoalService");
const ServiceService_1 = require("../service/ServiceService");
const permissionService = new PermissionService_1.PermissionService();
const companyService = new CompanyService_1.CompanyService();
const commissionService = new CommissionService_1.CommissionService();
const goalService = new GoalService_1.GoalService();
const serviceService = new ServiceService_1.ServiceService();
class AuthController {
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                const { token, user } = yield AuthService_1.AuthService.login(email, password);
                res.status(200).json({ token, user });
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(400).json({ message: 'An unknown error occurred' });
                }
            }
        });
    }
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, name, password, businessName, businessAddress } = req.body;
            try {
                if (!businessName) {
                    throw new Error("Nome da empresa é obrigatório");
                }
                if (!businessAddress) {
                    throw new Error("O endereço da empresa é obrigatório");
                }
                const { token, user } = yield AuthService_1.AuthService.register(email, name, password);
                if (!user.id) {
                    res.status(422).json({ message: "Ocorreu um erro ao cadastrar o usuário" });
                }
                yield permissionService.assignPermissionsToUser(user.id, user.role);
                const company = yield companyService.createCompany({
                    ownerId: user.id,
                    name: businessName,
                    address: businessAddress
                });
                const commissionConfig = yield commissionService.createDefaultCommissionConfig(user.id, company.id);
                const services = yield serviceService.getAllServices(company.id);
                for (const service of services) {
                    yield commissionService.createCommissionRule({
                        configId: commissionConfig.id,
                        serviceId: service.id,
                        serviceType: 'PERCENTAGE',
                        percentage: 40,
                    });
                }
                // Add goals from current month until end of year
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
                const currentYear = currentDate.getFullYear();
                // Create goals from current month to December
                for (let month = currentMonth; month <= 12; month++) {
                    yield goalService.createGoal({
                        userId: user.id,
                        companyId: company.id,
                        month: month,
                        year: currentYear,
                        target: 0 // Default target value
                    });
                }
                res.status(201).json({ token, user });
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(400).json({ message: 'An unknown error occurred' });
                }
            }
        });
    }
}
exports.AuthController = AuthController;
