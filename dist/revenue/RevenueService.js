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
exports.RevenueService = void 0;
const db_1 = __importDefault(require("../config/db/db"));
const client_1 = require("@prisma/client");
class RevenueService {
    // Obter o período baseado no ano e mês, ou usando datas personalizadas
    getPeriodDates(period, year, month, customStartDate, customEndDate) {
        // Se datas personalizadas foram fornecidas, use-as
        if (customStartDate && customEndDate) {
            return { startDate: customStartDate, endDate: customEndDate };
        }
        const now = new Date();
        let startDate;
        let endDate;
        switch (period) {
            case 'month':
                // Se não for informado o mês, usa o atual
                const targetMonth = month !== undefined ? month - 1 : now.getMonth();
                const targetYear = year || now.getFullYear();
                startDate = new Date(targetYear, targetMonth, 1);
                endDate = new Date(targetYear, targetMonth + 1, 0);
                break;
            case 'quarter':
                // Determina o trimestre atual ou especificado
                const currentQuarter = month
                    ? Math.ceil(month / 3)
                    : Math.ceil((now.getMonth() + 1) / 3);
                startDate = new Date(year, (currentQuarter - 1) * 3, 1);
                endDate = new Date(year, currentQuarter * 3, 0);
                break;
            case 'year':
            default:
                startDate = new Date(year, 0, 1);
                endDate = new Date(year, 11, 31, 23, 59, 59);
                break;
        }
        return { startDate, endDate };
    }
    // Faturamento mensal para o ano
    getMonthlyRevenue(companyId, year, period, customStartDate, customEndDate) {
        return __awaiter(this, void 0, void 0, function* () {
            // Se datas personalizadas foram fornecidas, ajuste o comportamento
            if (customStartDate && customEndDate) {
                console.log(`Usando datas personalizadas para faturamento mensal: ${customStartDate.toISOString()} - ${customEndDate.toISOString()}`);
            }
            const months = [
                'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
            ];
            const result = [];
            // Define o período para busca
            const { startDate: periodStart, endDate: periodEnd } = customStartDate && customEndDate ?
                { startDate: customStartDate, endDate: customEndDate } :
                { startDate: new Date(year, 0, 1), endDate: new Date(year, 11, 31, 23, 59, 59) };
            for (let month = 0; month < 12; month++) {
                const monthStartDate = new Date(year, month, 1);
                const monthEndDate = new Date(year, month + 1, 0, 23, 59, 59);
                // Verifica se o mês está no período personalizado
                if (customStartDate && customEndDate) {
                    if (monthEndDate < customStartDate || monthStartDate > customEndDate) {
                        // Mês fora do período, adiciona com valor zero
                        result.push({
                            name: months[month],
                            total: 0
                        });
                        continue;
                    }
                }
                const appointments = yield db_1.default.appointment.findMany({
                    where: {
                        companyId,
                        status: client_1.AppointmentStatusEnum.COMPLETED,
                        scheduledTime: {
                            gte: monthStartDate,
                            lte: monthEndDate
                        },
                        deletedAt: null
                    }
                });
                const total = appointments.reduce((sum, appointment) => sum + appointment.value, 0);
                result.push({
                    name: months[month],
                    total
                });
            }
            return result;
        });
    }
    // Faturamento por barbeiro
    getBarberRevenue(companyId, period, year, month, customStartDate, customEndDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startDate, endDate } = this.getPeriodDates(period, year, month, customStartDate, customEndDate);
            console.log(`Buscando faturamento por barbeiro no período: ${startDate.toISOString()} até ${endDate.toISOString()}`);
            // 1. Obtém todos os agendamentos concluídos no período para verificação
            const allAppointments = yield db_1.default.appointment.findMany({
                where: {
                    companyId,
                    status: client_1.AppointmentStatusEnum.COMPLETED,
                    scheduledTime: {
                        gte: startDate,
                        lte: endDate
                    },
                    deletedAt: null
                },
                select: {
                    id: true,
                    userId: true,
                    value: true
                }
            });
            console.log(`Total de agendamentos encontrados no período: ${allAppointments.length}`);
            // 2. Agrupa agendamentos por usuário para verificação
            const appointmentsByUser = allAppointments.reduce((acc, appointment) => {
                if (!acc[appointment.userId]) {
                    acc[appointment.userId] = [];
                }
                acc[appointment.userId].push(appointment);
                return acc;
            }, {});
            // 3. Mostra distribuição de agendamentos por userId
            console.log(`Distribuição de agendamentos por usuário: ${JSON.stringify(Object.keys(appointmentsByUser).map(userId => ({
                userId,
                count: appointmentsByUser[Number(userId)].length
            })))}`);
            // 4. Obtém todos os usuários associados à empresa - incluindo membros
            // Buscar todos os usuários que são proprietários de empresas
            const companyOwners = yield db_1.default.company.findMany({
                where: {
                    id: companyId,
                    deletedAt: null
                },
                select: {
                    owner: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
            // Buscar todos os membros da empresa
            const companyMembers = yield db_1.default.companyMember.findMany({
                where: {
                    companyId: companyId,
                    deletedAt: null
                },
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
            // Combinar os donos e membros em uma única lista de usuários únicos
            const userMap = new Map();
            // Adicionar os proprietários
            companyOwners.forEach(company => {
                if (company.owner) {
                    userMap.set(company.owner.id, company.owner);
                }
            });
            // Adicionar os membros
            companyMembers.forEach(member => {
                if (member.user) {
                    userMap.set(member.user.id, member.user);
                }
            });
            const users = Array.from(userMap.values());
            console.log(`Usuários encontrados na empresa: ${JSON.stringify(users.map(u => ({ id: u.id, name: u.name, role: u.role })))}`);
            const result = [];
            let totalRevenue = 0;
            // 5. Para cada usuário (tanto dono quanto membros), calcular o faturamento
            for (const user of users) {
                console.log(`Buscando agendamentos para usuário: ${user.name} (ID: ${user.id}, Role: ${user.role})`);
                // Verificar primeiro se há agendamentos no mapeamento antes de fazer a consulta
                if (appointmentsByUser[user.id] && appointmentsByUser[user.id].length > 0) {
                    // Usar os agendamentos já encontrados para economizar consultas
                    const appointments = appointmentsByUser[user.id];
                    console.log(`Encontrados ${appointments.length} agendamentos para o usuário ${user.name} (usando cache)`);
                    const revenue = appointments.reduce((sum, appointment) => sum + appointment.value, 0);
                    totalRevenue += revenue;
                    console.log(`Faturamento do usuário ${user.name}: ${revenue}`);
                    result.push({
                        id: user.id,
                        name: user.name,
                        revenue,
                        percentage: 0, // Será calculado após somar todos
                        color: '' // Será preenchido no frontend
                    });
                }
                else {
                    console.log(`Nenhum agendamento encontrado para o usuário ${user.name} no período`);
                    // Adicionar com valor zero para mostrar todos os usuários
                    result.push({
                        id: user.id,
                        name: user.name,
                        revenue: 0,
                        percentage: 0,
                        color: ''
                    });
                }
            }
            // Calcular as porcentagens
            if (totalRevenue > 0) {
                for (const item of result) {
                    item.percentage = parseFloat(((item.revenue / totalRevenue) * 100).toFixed(2));
                }
            }
            // Verificar resultados finais
            console.log(`Resultado final do faturamento por barbeiro: ${JSON.stringify(result)}`);
            return result;
        });
    }
    // Faturamento mensal por barbeiro
    getBarberMonthlyRevenue(companyId, year, customStartDate, customEndDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const months = [
                'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
            ];
            // Obter a empresa com o dono e membros
            const company = yield db_1.default.company.findUnique({
                where: {
                    id: companyId,
                    deletedAt: null
                },
                include: {
                    members: {
                        where: { deletedAt: null },
                        include: { user: true }
                    },
                    owner: true
                }
            });
            if (!company) {
                throw new Error(`Empresa com ID ${companyId} não encontrada`);
            }
            // Criar uma lista unificada dos usuários
            const users = [
                {
                    id: company.owner.id,
                    name: company.owner.name
                }
            ];
            // Adicionar cada membro da empresa à lista
            company.members.forEach(member => {
                if (member.user && !users.some(u => u.id === member.user.id)) {
                    users.push({
                        id: member.user.id,
                        name: member.user.name
                    });
                }
            });
            console.log(`Gerando faturamento mensal para ${users.length} usuários da empresa ${companyId}`);
            const result = [];
            // Determine period to use
            const startMonth = customStartDate ? customStartDate.getMonth() : 0;
            const endMonth = customEndDate ? customEndDate.getMonth() : 11;
            for (let month = 0; month < 12; month++) {
                // Skip months outside the custom range if specified
                if (customStartDate && customEndDate) {
                    if (month < startMonth || month > endMonth) {
                        continue;
                    }
                }
                const startDate = new Date(year, month, 1);
                const endDate = new Date(year, month + 1, 0, 23, 59, 59);
                const monthData = { name: months[month] };
                for (const user of users) {
                    const appointments = yield db_1.default.appointment.findMany({
                        where: {
                            companyId,
                            userId: user.id,
                            status: client_1.AppointmentStatusEnum.COMPLETED,
                            scheduledTime: {
                                gte: startDate,
                                lte: endDate
                            },
                            deletedAt: null
                        }
                    });
                    const revenue = appointments.reduce((sum, appointment) => sum + appointment.value, 0);
                    monthData[user.name] = revenue;
                }
                result.push(monthData);
            }
            return result;
        });
    }
    // Faturamento por serviço
    getServiceRevenue(companyId, userId, period, year, month, customStartDate, customEndDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startDate, endDate } = this.getPeriodDates(period || 'year', year || new Date().getFullYear(), month, customStartDate, customEndDate);
            // Buscar todos os agendamentos concluídos no período
            const appointments = yield db_1.default.appointment.findMany({
                where: Object.assign(Object.assign({ companyId }, (userId ? { userId } : {})), { status: client_1.AppointmentStatusEnum.COMPLETED, scheduledTime: {
                        gte: startDate,
                        lte: endDate
                    }, deletedAt: null }),
                include: {
                    services: {
                        include: {
                            service: true
                        }
                    }
                }
            });
            // Mapear serviços e calcular receita
            const serviceMap = new Map();
            appointments.forEach(appointment => {
                appointment.services.forEach(serviceAppointment => {
                    const { service, quantity } = serviceAppointment;
                    const revenue = service.price * quantity;
                    if (serviceMap.has(service.id)) {
                        const existing = serviceMap.get(service.id);
                        serviceMap.set(service.id, Object.assign(Object.assign({}, existing), { quantity: existing.quantity + quantity, revenue: existing.revenue + revenue }));
                    }
                    else {
                        serviceMap.set(service.id, {
                            id: service.id,
                            service: service.name,
                            quantity,
                            revenue,
                            percentage: 0 // Será calculado depois
                        });
                    }
                });
            });
            // Converter para array e calcular porcentagens
            const result = Array.from(serviceMap.values());
            const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);
            if (totalRevenue > 0) {
                result.forEach(item => {
                    item.percentage = parseFloat(((item.revenue / totalRevenue) * 100).toFixed(2));
                });
            }
            return result;
        });
    }
    // Faturamento por forma de pagamento
    getPaymentMethodRevenue(companyId, period, year, month, customStartDate, customEndDate) {
        return __awaiter(this, void 0, void 0, function* () {
            // Isto é um mock pois não temos dados de métodos de pagamento no banco
            // Em uma implementação real, você teria uma coluna paymentMethod na tabela de appointments
            const paymentMethods = [
                { name: 'Cartão de Crédito', percentage: 42, color: '#8B4513' },
                { name: 'Cartão de Débito', percentage: 33, color: '#A0522D' },
                { name: 'Dinheiro', percentage: 14, color: '#CD853F' },
                { name: 'Pix', percentage: 11, color: '#DEB887' }
            ];
            const { startDate, endDate } = this.getPeriodDates(period || 'year', year || new Date().getFullYear(), month, customStartDate, customEndDate);
            // Buscar o valor total no período
            const appointments = yield db_1.default.appointment.findMany({
                where: {
                    companyId,
                    status: client_1.AppointmentStatusEnum.COMPLETED,
                    scheduledTime: {
                        gte: startDate,
                        lte: endDate
                    },
                    deletedAt: null
                }
            });
            const totalRevenue = appointments.reduce((sum, appointment) => sum + appointment.value, 0);
            // Distribuir o valor total entre os métodos de pagamento
            return paymentMethods.map(method => (Object.assign(Object.assign({}, method), { value: (totalRevenue * method.percentage) / 100 })));
        });
    }
    // Faturamento por dia da semana
    getWeekdayRevenue(companyId, period, year, month, customStartDate, customEndDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startDate, endDate } = this.getPeriodDates(period || 'year', year || new Date().getFullYear(), month, customStartDate, customEndDate);
            const weekdays = [
                'Domingo', 'Segunda', 'Terça', 'Quarta',
                'Quinta', 'Sexta', 'Sábado'
            ];
            const appointments = yield db_1.default.appointment.findMany({
                where: {
                    companyId,
                    status: client_1.AppointmentStatusEnum.COMPLETED,
                    scheduledTime: {
                        gte: startDate,
                        lte: endDate
                    },
                    deletedAt: null
                }
            });
            // Inicializar array com zeros
            const weekdayRevenue = weekdays.map(name => ({ name, total: 0 }));
            // Somar faturamento por dia da semana
            appointments.forEach(appointment => {
                if (appointment.scheduledTime) {
                    const date = new Date(appointment.scheduledTime);
                    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, etc.
                    weekdayRevenue[dayOfWeek].total += appointment.value;
                }
            });
            return weekdayRevenue;
        });
    }
    // Faturamento por horário
    getHourlyRevenue(companyId, period, year, month, customStartDate, customEndDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startDate, endDate } = this.getPeriodDates(period || 'year', year || new Date().getFullYear(), month, customStartDate, customEndDate);
            const appointments = yield db_1.default.appointment.findMany({
                where: {
                    companyId,
                    status: client_1.AppointmentStatusEnum.COMPLETED,
                    scheduledTime: {
                        gte: startDate,
                        lte: endDate
                    },
                    deletedAt: null
                }
            });
            // Inicializar objeto para armazenar dados por hora
            const hourlyData = {};
            // Horário de abertura e fechamento (considerar 8h às 20h)
            for (let hour = 8; hour <= 20; hour++) {
                const hourFormatted = `${hour.toString().padStart(2, '0')}:00`;
                hourlyData[hourFormatted] = 0;
            }
            // Somar faturamento por hora
            appointments.forEach(appointment => {
                if (appointment.scheduledTime) {
                    const date = new Date(appointment.scheduledTime);
                    const hour = date.getHours();
                    const hourFormatted = `${hour.toString().padStart(2, '0')}:00`;
                    if (hourlyData[hourFormatted] !== undefined) {
                        hourlyData[hourFormatted] += appointment.value;
                    }
                }
            });
            // Converter para o formato esperado pelo gráfico
            return Object.entries(hourlyData).map(([hour, total]) => ({
                hour,
                total
            }));
        });
    }
    // Comparativo ano a ano
    getYearlyComparison(companyId, currentYear, customStartDate, customEndDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const months = [
                'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
            ];
            const previousYear = currentYear - 1;
            const result = [];
            // Determine months to include based on custom dates
            const startMonth = customStartDate ? Math.max(0, customStartDate.getMonth()) : 0;
            const endMonth = customEndDate ? Math.min(11, customEndDate.getMonth()) : 11;
            for (let month = 0; month < 12; month++) {
                // Skip months outside the custom range if specified
                if (customStartDate && customEndDate) {
                    if (month < startMonth || month > endMonth) {
                        continue;
                    }
                }
                // Dados do ano atual
                const currentStartDate = new Date(currentYear, month, 1);
                const currentEndDate = new Date(currentYear, month + 1, 0, 23, 59, 59);
                const currentAppointments = yield db_1.default.appointment.findMany({
                    where: {
                        companyId,
                        status: client_1.AppointmentStatusEnum.COMPLETED,
                        scheduledTime: {
                            gte: currentStartDate,
                            lte: currentEndDate
                        },
                        deletedAt: null
                    }
                });
                // Dados do ano anterior
                const prevStartDate = new Date(previousYear, month, 1);
                const prevEndDate = new Date(previousYear, month + 1, 0, 23, 59, 59);
                const prevAppointments = yield db_1.default.appointment.findMany({
                    where: {
                        companyId,
                        status: client_1.AppointmentStatusEnum.COMPLETED,
                        scheduledTime: {
                            gte: prevStartDate,
                            lte: prevEndDate
                        },
                        deletedAt: null
                    }
                });
                const currentTotal = currentAppointments.reduce((sum, appointment) => sum + appointment.value, 0);
                const prevTotal = prevAppointments.reduce((sum, appointment) => sum + appointment.value, 0);
                result.push({
                    name: months[month],
                    [previousYear.toString()]: prevTotal,
                    [currentYear.toString()]: currentTotal
                });
            }
            return result;
        });
    }
    // Ticket médio por barbeiro
    getAvgTicketByBarber(companyId, period, year, month, customStartDate, customEndDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startDate, endDate } = this.getPeriodDates(period || 'year', year || new Date().getFullYear(), month, customStartDate, customEndDate);
            // Buscar todos os usuários que são proprietários de empresas
            const companyOwners = yield db_1.default.company.findMany({
                where: {
                    id: companyId,
                    deletedAt: null
                },
                select: {
                    owner: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
            // Buscar todos os membros da empresa
            const companyMembers = yield db_1.default.companyMember.findMany({
                where: {
                    companyId: companyId,
                    deletedAt: null
                },
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
            // Combinar os donos e membros em uma única lista de usuários únicos
            const userMap = new Map();
            // Adicionar os proprietários
            companyOwners.forEach(company => {
                if (company.owner) {
                    userMap.set(company.owner.id, company.owner);
                }
            });
            // Adicionar os membros
            companyMembers.forEach(member => {
                if (member.user) {
                    userMap.set(member.user.id, member.user);
                }
            });
            const users = Array.from(userMap.values());
            const result = [];
            for (const user of users) {
                const appointments = yield db_1.default.appointment.findMany({
                    where: {
                        companyId,
                        userId: user.id,
                        status: client_1.AppointmentStatusEnum.COMPLETED,
                        scheduledTime: {
                            gte: startDate,
                            lte: endDate
                        },
                        deletedAt: null
                    }
                });
                if (appointments.length > 0) {
                    const totalRevenue = appointments.reduce((sum, appointment) => sum + appointment.value, 0);
                    const avgTicket = totalRevenue / appointments.length;
                    // Encontrar ticket mínimo e máximo
                    const values = appointments.map(a => a.value);
                    const maxTicket = Math.max(...values);
                    const minTicket = Math.min(...values);
                    result.push({
                        id: user.id,
                        name: user.name,
                        avgTicket: parseFloat(avgTicket.toFixed(2)),
                        maxTicket,
                        minTicket
                    });
                }
            }
            return result;
        });
    }
}
exports.RevenueService = RevenueService;
