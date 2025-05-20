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
exports.RevenueController = void 0;
const RevenueService_1 = require("./RevenueService");
const db_1 = __importDefault(require("../config/db/db"));
const revenueService = new RevenueService_1.RevenueService();
class RevenueController {
    // Faturamento mensal para o ano
    static getMonthlyRevenue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, period, startDate, endDate } = req.query;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const userId = req.userId;
            try {
                if (!userId || !companyId) {
                    res.status(400).json({ message: 'Parâmetros inválidos' });
                    return;
                }
                // Parse date strings if provided
                const parsedStartDate = startDate ? new Date(startDate) : undefined;
                const parsedEndDate = endDate ? new Date(endDate) : undefined;
                console.log(`Buscando faturamento mensal com intervalo: ${(parsedStartDate === null || parsedStartDate === void 0 ? void 0 : parsedStartDate.toISOString()) || 'N/A'} a ${(parsedEndDate === null || parsedEndDate === void 0 ? void 0 : parsedEndDate.toISOString()) || 'N/A'}`);
                const revenue = yield revenueService.getMonthlyRevenue(Number(companyId), year, period, parsedStartDate, parsedEndDate);
                res.status(200).json(revenue);
            }
            catch (error) {
                console.error('Erro ao buscar faturamento mensal:', error);
                res.status(500).json({ message: 'Erro ao buscar faturamento mensal' });
            }
        });
    }
    // Faturamento por barbeiro
    static getBarberRevenue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, period, startDate, endDate } = req.query;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const month = req.query.month ? parseInt(req.query.month) : undefined;
            const userId = req.userId;
            try {
                if (!userId || !companyId) {
                    res.status(400).json({ message: 'Parâmetros inválidos' });
                    return;
                }
                // Parse date strings if provided
                const parsedStartDate = startDate ? new Date(startDate) : undefined;
                const parsedEndDate = endDate ? new Date(endDate) : undefined;
                const revenue = yield revenueService.getBarberRevenue(Number(companyId), period || 'year', year, month, parsedStartDate, parsedEndDate);
                res.status(200).json(revenue);
            }
            catch (error) {
                console.error('Erro ao buscar faturamento por barbeiro:', error);
                res.status(500).json({ message: 'Erro ao buscar faturamento por barbeiro' });
            }
        });
    }
    // Faturamento mensal por barbeiro
    static getBarberMonthlyRevenue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, startDate, endDate } = req.query;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const userId = req.userId;
            try {
                if (!userId || !companyId) {
                    res.status(400).json({ message: 'Parâmetros inválidos' });
                    return;
                }
                // Parse date strings if provided
                const parsedStartDate = startDate ? new Date(startDate) : undefined;
                const parsedEndDate = endDate ? new Date(endDate) : undefined;
                const revenue = yield revenueService.getBarberMonthlyRevenue(Number(companyId), year, parsedStartDate, parsedEndDate);
                res.status(200).json(revenue);
            }
            catch (error) {
                console.error('Erro ao buscar faturamento mensal por barbeiro:', error);
                res.status(500).json({ message: 'Erro ao buscar faturamento mensal por barbeiro' });
            }
        });
    }
    // Faturamento por serviço
    static getServiceRevenue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, period, startDate, endDate } = req.query;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const month = req.query.month ? parseInt(req.query.month) : undefined;
            const specificUserId = req.query.userId ? parseInt(req.query.userId) : undefined;
            const userId = req.userId;
            try {
                if (!userId || !companyId) {
                    res.status(400).json({ message: 'Parâmetros inválidos' });
                    return;
                }
                // Parse date strings if provided
                const parsedStartDate = startDate ? new Date(startDate) : undefined;
                const parsedEndDate = endDate ? new Date(endDate) : undefined;
                const revenue = yield revenueService.getServiceRevenue(Number(companyId), specificUserId, period || 'year', year, month, parsedStartDate, parsedEndDate);
                res.status(200).json(revenue);
            }
            catch (error) {
                console.error('Erro ao buscar faturamento por serviço:', error);
                res.status(500).json({ message: 'Erro ao buscar faturamento por serviço' });
            }
        });
    }
    // Faturamento por forma de pagamento
    static getPaymentMethodRevenue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, period, startDate, endDate } = req.query;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const month = req.query.month ? parseInt(req.query.month) : undefined;
            const userId = req.userId;
            try {
                if (!userId || !companyId) {
                    res.status(400).json({ message: 'Parâmetros inválidos' });
                    return;
                }
                // Parse date strings if provided
                const parsedStartDate = startDate ? new Date(startDate) : undefined;
                const parsedEndDate = endDate ? new Date(endDate) : undefined;
                const revenue = yield revenueService.getPaymentMethodRevenue(Number(companyId), period || 'year', year, month, parsedStartDate, parsedEndDate);
                res.status(200).json(revenue);
            }
            catch (error) {
                console.error('Erro ao buscar faturamento por método de pagamento:', error);
                res.status(500).json({ message: 'Erro ao buscar faturamento por método de pagamento' });
            }
        });
    }
    // Faturamento por dia da semana
    static getWeekdayRevenue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, period, startDate, endDate } = req.query;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const month = req.query.month ? parseInt(req.query.month) : undefined;
            const userId = req.userId;
            try {
                if (!userId || !companyId) {
                    res.status(400).json({ message: 'Parâmetros inválidos' });
                    return;
                }
                // Parse date strings if provided
                const parsedStartDate = startDate ? new Date(startDate) : undefined;
                const parsedEndDate = endDate ? new Date(endDate) : undefined;
                const revenue = yield revenueService.getWeekdayRevenue(Number(companyId), period || 'year', year, month, parsedStartDate, parsedEndDate);
                res.status(200).json(revenue);
            }
            catch (error) {
                console.error('Erro ao buscar faturamento por dia da semana:', error);
                res.status(500).json({ message: 'Erro ao buscar faturamento por dia da semana' });
            }
        });
    }
    // Faturamento por horário
    static getHourlyRevenue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, period, startDate, endDate } = req.query;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const month = req.query.month ? parseInt(req.query.month) : undefined;
            const userId = req.userId;
            try {
                if (!userId || !companyId) {
                    res.status(400).json({ message: 'Parâmetros inválidos' });
                    return;
                }
                // Parse date strings if provided
                const parsedStartDate = startDate ? new Date(startDate) : undefined;
                const parsedEndDate = endDate ? new Date(endDate) : undefined;
                const revenue = yield revenueService.getHourlyRevenue(Number(companyId), period || 'year', year, month, parsedStartDate, parsedEndDate);
                res.status(200).json(revenue);
            }
            catch (error) {
                console.error('Erro ao buscar faturamento por horário:', error);
                res.status(500).json({ message: 'Erro ao buscar faturamento por horário' });
            }
        });
    }
    // Comparativo ano a ano
    static getYearlyComparison(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, startDate, endDate } = req.query;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const userId = req.userId;
            try {
                if (!userId || !companyId) {
                    res.status(400).json({ message: 'Parâmetros inválidos' });
                    return;
                }
                // Parse date strings if provided
                const parsedStartDate = startDate ? new Date(startDate) : undefined;
                const parsedEndDate = endDate ? new Date(endDate) : undefined;
                const revenue = yield revenueService.getYearlyComparison(Number(companyId), year, parsedStartDate, parsedEndDate);
                res.status(200).json(revenue);
            }
            catch (error) {
                console.error('Erro ao buscar comparativo anual:', error);
                res.status(500).json({ message: 'Erro ao buscar comparativo anual' });
            }
        });
    }
    // Ticket médio por barbeiro
    static getAvgTicketByBarber(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, period, startDate, endDate } = req.query;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const month = req.query.month ? parseInt(req.query.month) : undefined;
            const userId = req.userId;
            try {
                if (!userId || !companyId) {
                    res.status(400).json({ message: 'Parâmetros inválidos' });
                    return;
                }
                // Parse date strings if provided
                const parsedStartDate = startDate ? new Date(startDate) : undefined;
                const parsedEndDate = endDate ? new Date(endDate) : undefined;
                const revenue = yield revenueService.getAvgTicketByBarber(Number(companyId), period || 'year', year, month, parsedStartDate, parsedEndDate);
                res.status(200).json(revenue);
            }
            catch (error) {
                console.error('Erro ao buscar ticket médio por barbeiro:', error);
                res.status(500).json({ message: 'Erro ao buscar ticket médio por barbeiro' });
            }
        });
    }
    // Faturamento por usuário específico (para o barbeiro ver seus próprios dados)
    static getUserRevenue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, period, startDate, endDate } = req.query;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const month = req.query.month ? parseInt(req.query.month) : undefined;
            const userId = req.userId;
            try {
                if (!userId || !companyId) {
                    res.status(400).json({ message: 'Parâmetros inválidos' });
                    return;
                }
                // Parse date strings if provided
                const parsedStartDate = startDate ? new Date(startDate) : undefined;
                const parsedEndDate = endDate ? new Date(endDate) : undefined;
                // Usamos o getMonthlyRevenue para obter todos os meses, mas filtramos pelo ID do usuário logado
                const allBarberData = yield revenueService.getBarberMonthlyRevenue(Number(companyId), year, parsedStartDate, parsedEndDate);
                // Obter o nome do usuário para filtrar
                const userData = yield db_1.default.user.findUnique({
                    where: { id: userId },
                    select: { name: true }
                });
                if (!userData) {
                    res.status(404).json({ message: 'Usuário não encontrado' });
                    return;
                }
                // Converter para o formato esperado no frontend (similar ao revenueData)
                const userRevenueData = allBarberData.map(monthData => ({
                    name: monthData.name,
                    total: monthData[userData.name] || 0
                }));
                res.status(200).json(userRevenueData);
            }
            catch (error) {
                console.error('Erro ao buscar faturamento do usuário:', error);
                res.status(500).json({ message: 'Erro ao buscar faturamento do usuário' });
            }
        });
    }
}
exports.RevenueController = RevenueController;
