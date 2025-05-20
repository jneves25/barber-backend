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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db")); // Certifique-se de que o caminho esteja correto para o seu Prisma Client
const permissions = [
    { name: 'Ver todos os agendamentos', description: 'Acesso para visualizar agendamentos de todos os barbeiros' },
    { name: 'Gerenciar agendamentos', description: 'Criar, editar e excluir agendamentos' },
    { name: 'Ver próprios agendamentos', description: 'Acesso para visualizar apenas seus próprios agendamentos' },
    { name: 'Ver todos os clientes', description: 'Acesso para visualizar todos os clientes cadastrados' },
    { name: 'Gerenciar clientes', description: 'Criar, editar e excluir clientes' },
    { name: 'Ver próprios clientes', description: 'Acesso para visualizar apenas seus próprios clientes' },
    { name: 'Ver todos os serviços', description: 'Acesso para visualizar todos os serviços disponíveis' },
    { name: 'Gerenciar serviços', description: 'Criar, editar e excluir serviços' },
    { name: 'Ver serviços', description: 'Acesso para visualizar serviços disponíveis' },
    { name: 'Ver todos os produtos', description: 'Acesso para visualizar todos os produtos disponíveis' },
    { name: 'Gerenciar produtos', description: 'Criar, editar e excluir produtos' },
    { name: 'Ver produtos', description: 'Acesso para visualizar produtos disponíveis' },
    { name: 'Ver todos os barbeiros', description: 'Acesso para visualizar todos os barbeiros' },
    { name: 'Gerenciar barbeiros', description: 'Criar, editar e excluir barbeiros' },
    { name: 'Ver todas as comissões', description: 'Acesso para visualizar comissões de todos os barbeiros' },
    { name: 'Gerenciar comissões', description: 'Configurar e ajustar comissões' },
    { name: 'Ver próprias comissões', description: 'Acesso para visualizar apenas suas próprias comissões' },
    { name: 'Ver todas as metas', description: 'Acesso para visualizar metas de todos os barbeiros' },
    { name: 'Gerenciar metas', description: 'Definir e ajustar metas' },
    { name: 'Ver próprias metas', description: 'Acesso para visualizar apenas suas próprias metas' },
    { name: 'Ver faturamento completo', description: 'Acesso para visualizar todo o faturamento da barbearia' },
    { name: 'Ver próprio faturamento', description: 'Acesso para visualizar apenas sua contribuição no faturamento' },
    { name: 'Gerenciar configurações', description: 'Acesso para alterar configurações do sistema' },
    { name: 'Gerenciar permissões', description: 'Acesso para configurar permissões de usuários' },
    { name: 'Ver usuários', description: 'Acesso para visualizar todos os usuários' },
    { name: 'Gerenciar usuários', description: 'Acesso para criar, editar e excluir usuários' },
];
const permissionTranslations = {
    'Ver todos os agendamentos': 'view-all-appointments',
    'Gerenciar agendamentos': 'manage-appointments',
    'Ver próprios agendamentos': 'view-own-appointments',
    'Ver todos os clientes': 'view-all-clients',
    'Gerenciar clientes': 'manage-clients',
    'Ver próprios clientes': 'view-own-clients',
    'Ver todos os serviços': 'view-all-services',
    'Gerenciar serviços': 'manage-services',
    'Ver serviços': 'view-services',
    'Ver todos os produtos': 'view-all-products',
    'Gerenciar produtos': 'manage-products',
    'Ver produtos': 'view-products',
    'Ver todos os barbeiros': 'view-all-barbers',
    'Gerenciar barbeiros': 'manage-barbers',
    'Ver todas as comissões': 'view-all-commissions',
    'Gerenciar comissões': 'manage-commissions',
    'Ver próprias comissões': 'view-own-commissions',
    'Ver todas as metas': 'view-all-goals',
    'Gerenciar metas': 'manage-goals',
    'Ver próprias metas': 'view-own-goals',
    'Ver faturamento completo': 'view-full-revenue',
    'Ver próprio faturamento': 'view-own-revenue',
    'Gerenciar configurações': 'manage-settings',
    'Gerenciar permissões': 'manage-permissions',
    'Ver usuários': 'view-users',
    'Gerenciar usuários': 'manage-users',
};
const permissionFieldMapping = {
    'view-all-appointments': 'viewAllAppointments',
    'manage-appointments': 'manageAppointments',
    'view-own-appointments': 'viewOwnAppointments',
    'view-all-clients': 'viewAllClients',
    'manage-clients': 'manageClients',
    'view-own-clients': 'viewOwnClients',
    'view-all-services': 'viewAllServices',
    'manage-services': 'manageServices',
    'view-services': 'viewServices',
    'view-all-products': 'viewAllProducts',
    'manage-products': 'manageProducts',
    'view-products': 'viewProducts',
    'view-all-barbers': 'viewAllBarbers',
    'manage-barbers': 'manageBarbers',
    'view-all-commissions': 'viewAllCommissions',
    'manage-commissions': 'manageCommissions',
    'view-own-commissions': 'viewOwnCommissions',
    'view-all-goals': 'viewAllGoals',
    'manage-goals': 'manageGoals',
    'view-own-goals': 'viewOwnGoals',
    'view-full-revenue': 'viewFullRevenue',
    'view-own-revenue': 'viewOwnRevenue',
    'manage-settings': 'manageSettings',
    'manage-permissions': 'managePermissions',
    'view-users': 'viewUsers',
    'manage-users': 'manageUsers',
};
const seedPermissions = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create a test user if needed
        const testUser = yield db_1.default.user.findFirst({
            where: { email: 'admin@test.com' },
        });
        let userId;
        if (!testUser) {
            const newUser = yield db_1.default.user.create({
                data: {
                    email: 'admin@test.com',
                    name: 'Admin Test',
                    password: 'hashed_password_here', // You should hash this in a real scenario
                    role: 'ADMIN',
                },
            });
            userId = newUser.id;
            console.log('Test user created with ID:', userId);
        }
        else {
            userId = testUser.id;
            console.log('Using existing test user with ID:', userId);
        }
        // Check if the user already has permissions
        const existingPermissions = yield db_1.default.permission.findUnique({
            where: { userId: userId },
        });
        if (!existingPermissions) {
            // Create a new permission entry for the user with all permissions set
            yield db_1.default.permission.create({
                data: {
                    userId: userId,
                    manageCompany: true,
                    viewCompanys: true,
                    addMember: true,
                    managePermissions: true,
                    viewPermissions: true,
                    viewAllAppointments: true,
                    manageAppointments: true,
                    viewOwnAppointments: true,
                    viewAllClients: true,
                    manageClients: true,
                    viewOwnClients: true,
                    viewAllServices: true,
                    manageServices: true,
                    viewServices: true,
                    viewAllProducts: true,
                    manageProducts: true,
                    viewProducts: true,
                    viewAllBarbers: true,
                    manageBarbers: true,
                    viewAllCommissions: true,
                    manageCommissions: true,
                    viewOwnCommissions: true,
                    viewAllGoals: true,
                    manageGoals: true,
                    viewOwnGoals: true,
                    viewFullRevenue: true,
                    viewOwnRevenue: true,
                    manageSettings: true,
                    viewUsers: true,
                    manageUsers: true
                },
            });
            console.log(`Permissões criadas com sucesso para o usuário ID ${userId}!`);
        }
        else {
            console.log(`Permissões já existem para o usuário ID ${userId}, não inserindo.`);
        }
    }
    catch (error) {
        console.error('Erro ao inserir permissões:', error);
    }
});
seedPermissions();
