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
const AuthService_1 = require("../auth/AuthService");
const PermissionService_1 = require("../permission/PermissionService");
const CompanyService_1 = require("../company/CompanyService");
const CommissionService_1 = require("../commission/CommissionService");
const GoalService_1 = require("../goal/GoalService");
const client_1 = require("@prisma/client");
function createAdminUser() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 1. Criar o usuário
            const { user } = yield AuthService_1.AuthService.register('admin@barbearia.com', 'Administrador', 'admin123');
            if (!user.id) {
                throw new Error('Falha ao criar usuário');
            }
            // 2. Atribuir permissões de administrador
            const permissionService = new PermissionService_1.PermissionService();
            yield permissionService.assignPermissionsToUser(user.id, client_1.RoleEnum.ADMIN);
            // 3. Criar empresa para o administrador
            const companyService = new CompanyService_1.CompanyService();
            const company = yield companyService.createCompany({
                ownerId: user.id,
                name: 'Barbearia Admin',
                address: 'Rua Principal, 123'
            });
            // 4. Configurar comissões padrão
            const commissionService = new CommissionService_1.CommissionService();
            yield commissionService.createDefaultCommissionConfig(user.id, company.id);
            // 5. Configurar metas iniciais
            const goalService = new GoalService_1.GoalService();
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();
            for (let month = currentMonth; month <= 12; month++) {
                yield goalService.createGoal({
                    userId: user.id,
                    companyId: company.id,
                    month: month,
                    year: currentYear,
                    target: 0
                });
            }
            console.log('Usuário administrador criado com sucesso!');
            console.log('Email: admin@barbearia.com');
            console.log('Senha: admin123');
        }
        catch (error) {
            console.error('Erro ao criar usuário administrador:', error);
        }
    });
}
createAdminUser();
