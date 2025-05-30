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
exports.StatisticsController = void 0;
const StatisticsService_1 = require("../statistics/StatisticsService");
class StatisticsController {
    /**
     * Obter estatísticas do dashboard
     */
    static getDashboardStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                const { period, startDate, endDate, userId } = req.query;
                const loggedUserId = req.userId;
                const permissions = req.userPermissions || {};
                // Verificar se o usuário só pode ver estatísticas próprias
                const canViewOnlyOwn = permissions.viewOwnStatistics && !permissions.viewFullStatistics;
                // Se tiver permissão apenas própria, forçar o userId como o próprio usuário
                const filteredUserId = canViewOnlyOwn
                    ? loggedUserId
                    : (userId ? Number(userId) : undefined);
                const stats = yield StatisticsController.statisticsService.getDashboardStats(Number(companyId), period, startDate, endDate, filteredUserId);
                res.status(200).json({
                    success: true,
                    data: stats,
                    status: 200
                });
            }
            catch (error) {
                console.error("Error in getDashboardStats controller:", error);
                res.status(500).json({
                    success: false,
                    message: 'Erro ao obter estatísticas do dashboard',
                    status: 500
                });
            }
        });
    }
    /**
     * Obter agendamentos do dia atual
     * @param req Request com os parâmetros companyId e limit opcional
     * @param res Response com os agendamentos do dia atual
     */
    static getUpcomingAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                const { limit } = req.query;
                const loggedUserId = req.userId;
                const permissions = req.userPermissions || {};
                // Obter os agendamentos
                const appointments = yield StatisticsController.statisticsService.getUpcomingAppointments(Number(companyId), limit ? Number(limit) : undefined);
                // Filtrar por usuário se tiver apenas permissão própria
                let filteredAppointments = appointments;
                if (permissions.viewOwnStatistics && !permissions.viewFullStatistics) {
                    filteredAppointments = appointments.filter(app => app.userId === loggedUserId);
                }
                res.status(200).json({
                    success: true,
                    data: filteredAppointments,
                    status: 200
                });
            }
            catch (error) {
                console.error("Erro ao buscar agendamentos do dia atual:", error);
                res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar agendamentos do dia atual',
                    status: 500
                });
            }
        });
    }
    /**
     * Obter principais serviços
     */
    static getTopServices(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                const { period, userId } = req.query;
                const { startDate, endDate } = req.query;
                const loggedUserId = req.userId;
                const permissions = req.userPermissions || {};
                // Verificar se o usuário só pode ver estatísticas próprias
                const canViewOnlyOwn = permissions.viewOwnStatistics && !permissions.viewFullStatistics;
                // Se tiver permissão apenas própria, forçar o userId como o próprio usuário
                const filteredUserId = canViewOnlyOwn
                    ? loggedUserId
                    : (userId ? Number(userId) : undefined);
                const services = yield StatisticsController.statisticsService.getTopServices(Number(companyId), period, filteredUserId, startDate, endDate);
                // Adaptar o formato para o esperado pelo frontend
                const formattedServices = services.map((service) => (Object.assign(Object.assign({}, service), { service: service.name || service.service, quantity: service.count || service.quantity || 0 })));
                res.status(200).json({
                    success: true,
                    data: formattedServices,
                    status: 200
                });
            }
            catch (error) {
                console.error("Error in getTopServices controller:", error);
                res.status(500).json({
                    success: false,
                    message: 'Erro ao obter principais serviços',
                    status: 500
                });
            }
        });
    }
    /**
     * Obter comissões dos barbeiros
     */
    static getBarberCommissions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                const { period, startDate, endDate } = req.query;
                const loggedUserId = req.userId;
                const permissions = req.userPermissions || {};
                const commissions = yield StatisticsController.statisticsService.getBarberCommissions(Number(companyId), period, startDate, endDate);
                // Filtrar por usuário se tiver apenas permissão própria
                let filteredCommissions = commissions;
                if (permissions.viewOwnStatistics && !permissions.viewFullStatistics) {
                    filteredCommissions = commissions.filter(item => item.id === loggedUserId);
                }
                // Formatar as comissões para incluir o totalCommission já calculado pelo service
                const formattedCommissions = filteredCommissions.map(item => ({
                    id: item.id,
                    userId: item.id,
                    name: item.name,
                    revenue: item.revenue || 0,
                    percentage: item.percentage || 0,
                    totalCommission: parseFloat(item.totalCommission.toFixed(2)), // Usar o totalCommission já calculado
                    appointmentCount: item.appointmentCount || 0
                }));
                console.log("Formatted commissions:", formattedCommissions);
                res.status(200).json({
                    success: true,
                    data: formattedCommissions,
                    status: 200
                });
            }
            catch (error) {
                console.error("Error in getBarberCommissions controller:", error);
                res.status(500).json({
                    success: false,
                    message: 'Erro ao obter comissões dos barbeiros',
                    status: 500
                });
            }
        });
    }
    /**
     * Obter agendamentos de um barbeiro específico
     */
    static getBarberAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                const { barberId } = req.query;
                const { startDate, endDate } = req.query;
                const loggedUserId = req.userId;
                const permissions = req.userPermissions || {};
                // Verificar se o usuário só pode ver estatísticas próprias
                const canViewOnlyOwn = permissions.viewOwnStatistics && !permissions.viewFullStatistics;
                // Se tiver permissão apenas própria, forçar o barberId como o próprio usuário
                const filteredBarberId = canViewOnlyOwn
                    ? loggedUserId
                    : (barberId ? Number(barberId) : undefined);
                // Buscar os agendamentos
                const appointments = yield StatisticsController.statisticsService.getUpcomingAppointments(Number(companyId), 10 // Listar mais agendamentos
                );
                // Filtrar por barbeiro se especificado
                const filteredAppointments = filteredBarberId
                    ? appointments.filter((a) => a.userId === filteredBarberId)
                    : (canViewOnlyOwn ? [] : appointments); // Se só pode ver próprio e não especificou, retorna vazio
                res.status(200).json({
                    success: true,
                    data: filteredAppointments,
                    status: 200
                });
            }
            catch (error) {
                console.error("Error in getBarberAppointments controller:", error);
                res.status(500).json({
                    success: false,
                    message: 'Erro ao obter agendamentos do barbeiro',
                    status: 500
                });
            }
        });
    }
    /**
     * Obter projeções de faturamento e comissões
     */
    static getProjections(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                const loggedUserId = req.userId;
                const permissions = req.userPermissions || {};
                // Verificar se o usuário só pode ver estatísticas próprias
                const canViewOnlyOwn = permissions.viewOwnStatistics && !permissions.viewFullStatistics;
                // Obter os agendamentos pendentes
                const pendingAppointments = yield StatisticsController.statisticsService.getPendingAppointments(Number(companyId));
                // Filtrar por usuário se tiver apenas permissão própria
                let filteredAppointments = pendingAppointments;
                if (canViewOnlyOwn) {
                    filteredAppointments = pendingAppointments.filter(app => app.userId === loggedUserId);
                }
                // Obter as comissões dos barbeiros para calcular as projeções
                const commissions = yield StatisticsController.statisticsService.getBarberCommissions(Number(companyId), 'custom', // Usando custom em vez de all para ser compatível com o tipo
                undefined, undefined);
                // Preparar os dados agregados
                const totalPending = filteredAppointments.reduce((sum, app) => sum + app.value, 0);
                // Calcular projeções por barbeiro
                const barberProjections = yield Promise.all(commissions.map((barber) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const barberPendingApps = pendingAppointments.filter((app) => app.userId === barber.id);
                    let projectedCommission = 0;
                    let pendingValue = 0;
                    // Obter a configuração de comissão do barbeiro
                    const commissionConfig = yield StatisticsController.statisticsService.getBarberCommissionConfig(Number(companyId), barber.id);
                    // Para cada agendamento pendente
                    for (const app of barberPendingApps) {
                        pendingValue += app.value;
                        // Para cada serviço no agendamento
                        for (const serviceAppointment of app.services) {
                            const { service, quantity } = serviceAppointment;
                            const serviceValue = service.price * quantity;
                            // Buscar regra específica para este serviço
                            const serviceRule = (_a = commissionConfig === null || commissionConfig === void 0 ? void 0 : commissionConfig.rules) === null || _a === void 0 ? void 0 : _a.find(rule => rule.serviceId === service.id);
                            if ((commissionConfig === null || commissionConfig === void 0 ? void 0 : commissionConfig.commissionType) === 'SERVICES' && serviceRule) {
                                // Se o tipo de comissão é por serviço e existe uma regra específica, usar ela
                                const serviceCommission = (serviceValue * serviceRule.percentage) / 100;
                                projectedCommission += serviceCommission;
                            }
                            else if ((commissionConfig === null || commissionConfig === void 0 ? void 0 : commissionConfig.commissionType) === 'GENERAL') {
                                // Se o tipo de comissão é geral, usar a comissão geral
                                const serviceCommission = (serviceValue * ((commissionConfig === null || commissionConfig === void 0 ? void 0 : commissionConfig.commissionValue) || 20)) / 100;
                                projectedCommission += serviceCommission;
                            }
                            else {
                                // Se não tem nenhuma configuração, usar 20% como padrão
                                const serviceCommission = (serviceValue * 20) / 100;
                                projectedCommission += serviceCommission;
                            }
                        }
                    }
                    // Calcular a taxa de comissão baseada na comissão atual e receita
                    let commissionRate = 0.2; // Default 20%
                    let commissionPercentage = 20; // Valor em porcentagem (%)
                    if (barber.revenue > 0 && barber.totalCommission !== undefined) {
                        commissionRate = barber.totalCommission / barber.revenue;
                        commissionPercentage = Math.round(commissionRate * 100);
                        console.log(`Calculando comissão baseado no histórico para ${barber.name}: ${commissionPercentage}%`);
                    }
                    console.log(`Barbeiro: ${barber.name}, Comissão: ${commissionPercentage}%, Taxa: ${commissionRate}, Valor pendente: ${pendingValue}, Comissão projetada: ${projectedCommission}`);
                    return {
                        id: barber.id,
                        name: barber.name,
                        pendingAppointments: barberPendingApps.length,
                        pendingValue,
                        projectedCommission,
                        commissionRate,
                        commissionPercentage
                    };
                })));
                // Filtrar projeções de barbeiros se o usuário só pode ver próprias
                const filteredBarberProjections = canViewOnlyOwn
                    ? barberProjections.filter(proj => proj.id === loggedUserId)
                    : barberProjections;
                // Calcular o total de comissões projetadas
                const totalProjectedCommission = filteredBarberProjections.reduce((sum, barber) => sum + barber.projectedCommission, 0);
                // Formatar resultado final
                const result = {
                    pendingAppointments: filteredAppointments.length,
                    totalPendingValue: totalPending,
                    totalProjectedCommission,
                    netProjectedRevenue: totalPending - totalProjectedCommission,
                    barberProjections: filteredBarberProjections
                };
                res.status(200).json({
                    success: true,
                    data: result,
                    status: 200
                });
            }
            catch (error) {
                console.error("Error in getProjections controller:", error);
                res.status(500).json({
                    success: false,
                    message: 'Erro ao obter projeções de faturamento',
                    status: 500
                });
            }
        });
    }
}
exports.StatisticsController = StatisticsController;
StatisticsController.statisticsService = new StatisticsService_1.StatisticsService();
