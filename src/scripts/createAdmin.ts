import { AuthService } from '../auth/AuthService';
import { PermissionService } from '../permission/PermissionService';
import { CompanyService } from '../company/CompanyService';
import { CommissionService } from '../commission/CommissionService';
import { GoalService } from '../goal/GoalService';
import { RoleEnum } from '@prisma/client';

async function createAdminUser() {
    try {
        // 1. Criar o usuário
        const { user } = await AuthService.register(
            'admin@barbearia.com',
            'Administrador',
            'admin123'
        );

        if (!user.id) {
            throw new Error('Falha ao criar usuário');
        }

        // 2. Atribuir permissões de administrador
        const permissionService = new PermissionService();
        await permissionService.assignPermissionsToUser(user.id, RoleEnum.ADMIN);

        // 3. Criar empresa para o administrador
        const companyService = new CompanyService();
        const company = await companyService.createCompany({
            ownerId: user.id,
            name: 'Barbearia Admin',
            address: 'Rua Principal, 123'
        });

        // 4. Configurar comissões padrão
        const commissionService = new CommissionService();
        await commissionService.createDefaultCommissionConfig(user.id, company.id);

        // 5. Configurar metas iniciais
        const goalService = new GoalService();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        for (let month = currentMonth; month <= 12; month++) {
            await goalService.createGoal({
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

    } catch (error) {
        console.error('Erro ao criar usuário administrador:', error);
    }
}

createAdminUser(); 