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
                // Para cada barbeiro, calcular a comissão com base na configuração
                const formattedCommissions = yield Promise.all(filteredCommissions.map((item) => __awaiter(this, void 0, void 0, function* () {
                    // Calcular a comissão com base na configuração do barbeiro
                    const commissionConfig = yield StatisticsController.statisticsService.getBarberCommissionConfig(Number(companyId), item.id);
                    // Calcular comissão total com base na receita e percentual
                    const commissionPercent = (commissionConfig === null || commissionConfig === void 0 ? void 0 : commissionConfig.commissionValue) || 20; // Padrão 20%
                    const totalCommission = (item.revenue * commissionPercent) / 100;
                    return {
                        id: item.id,
                        userId: item.id,
                        name: item.name,
                        revenue: item.revenue || 0,
                        percentage: item.percentage || 0,
                        totalCommission: parseFloat(totalCommission.toFixed(2)), // Arredonda para 2 casas decimais
                        appointmentCount: item.appointmentCount || 0
                    };
                })));
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
                    const barberPendingApps = pendingAppointments.filter((app) => app.userId === barber.id);
                    const pendingValue = barberPendingApps.reduce((sum, app) => sum + app.value, 0);
                    // Obter configuração de comissão do barbeiro
                    const commissionConfig = yield StatisticsController.statisticsService.getBarberCommissionConfig(Number(companyId), barber.id);
                    // Calcular o percentual de comissão - usar comissão fixa ou calcular baseado na relação revenue/commission
                    let commissionRate = 0.2; // Default 20%
                    let commissionPercentage = 20; // Valor em porcentagem (%)
                    // Prioridade 1: Usar configuração direta do barbeiro
                    if ((commissionConfig === null || commissionConfig === void 0 ? void 0 : commissionConfig.commissionValue) !== undefined && (commissionConfig === null || commissionConfig === void 0 ? void 0 : commissionConfig.commissionValue) !== null) {
                        commissionPercentage = commissionConfig.commissionValue;
                        commissionRate = commissionPercentage / 100;
                        console.log(`Usando configuração de comissão do barbeiro ${barber.name}: ${commissionPercentage}%`);
                    }
                    // Prioridade 2: Usar o valor totalCommission já calculado pelo serviço de barberCommissions 
                    else if (barber.totalCommission !== undefined && barber.revenue > 0) {
                        commissionRate = barber.totalCommission / barber.revenue;
                        commissionPercentage = Math.round(commissionRate * 100);
                        console.log(`Calculando comissão baseado no histórico para ${barber.name}: ${commissionPercentage}%`);
                    }
                    console.log(`Barbeiro: ${barber.name}, Comissão: ${commissionPercentage}%, Taxa: ${commissionRate}, Valor pendente: ${pendingValue}, Comissão projetada: ${pendingValue * commissionRate}`);
                    const projectedCommission = pendingValue * commissionRate;
                    return {
                        id: barber.id,
                        name: barber.name,
                        pendingAppointments: barberPendingApps.length,
                        pendingValue,
                        projectedCommission,
                        commissionRate,
                        commissionPercentage // Adicionando o percentual para exibição
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
