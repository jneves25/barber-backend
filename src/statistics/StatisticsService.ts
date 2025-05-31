import prisma from '../config/db/db';
import { AppointmentStatusEnum, CommissionModeEnum, CommissionTypeEnum } from '@prisma/client';

export interface DashboardStats {
	revenue: {
		total: number;
		trend: number;
		previousTotal: number;
	};
	clients: {
		total: number;
		trend: number;
		previousTotal: number;
	};
	appointments: {
		total: number;
		trend: number;
		previousTotal: number;
	};
	services: {
		total: number;
		trend: number;
		previousTotal: number;
	};
	commission: {
		total: number;
		trend: number;
		previousTotal: number;
	};
	productsSold: {
		total: number;
		trend: number;
		previousTotal: number;
	};
}

export class StatisticsService {
	/**
	 * Obter estatísticas do dashboard
	 * @param companyId ID da empresa
	 * @param period Período: today, week, month, year, all, custom
	 * @param startDate Data inicial para período custom
	 * @param endDate Data final para período custom
	 * @param userId ID do usuário para filtrar (opcional)
	 * @returns DashboardStats
	 */
	async getDashboardStats(
		companyId: number,
		period: 'today' | 'week' | 'month' | 'year' | 'all' | 'custom' = 'month',
		startDate?: string,
		endDate?: string,
		userId?: number
	): Promise<DashboardStats> {
		try {
			console.log(`[StatisticsService] getDashboardStats iniciado:`, { companyId, period, startDate, endDate, userId });

			// Definir datas de início e fim com base no período
			let start = new Date();
			let end = new Date();

			switch (period) {
				case 'today':
					start.setHours(0, 0, 0, 0);
					break;
				case 'week':
					start.setDate(start.getDate() - 7);
					break;
				case 'month':
					start.setDate(1);
					start.setHours(0, 0, 0, 0);
					break;
				case 'year':
					start.setMonth(0, 1);
					start.setHours(0, 0, 0, 0);
					break;
				case 'custom':
					if (startDate) {
						start = new Date(startDate);
						start.setHours(0, 0, 0, 0);
					}
					if (endDate) {
						end = new Date(endDate);
						end.setHours(23, 59, 59, 999);
					}
					break;
			}

			console.log(`[StatisticsService] Período calculado:`, {
				startDate: start.toISOString(),
				endDate: end.toISOString()
			});

			// Calcular o período comparativo (mesmo período do mês anterior)
			const { comparativeStartDate, comparativeEndDate } = this.calculateComparativePeriod(start, end);

			console.log(`[StatisticsService] Período comparativo:`, {
				comparativeStartDate: comparativeStartDate.toISOString(),
				comparativeEndDate: comparativeEndDate.toISOString()
			});

			// Buscar agendamentos do período atual
			const appointments = await prisma.appointment.findMany({
				where: {
					companyId,
					scheduledTime: {
						gte: start,
						lte: end
					},
					deletedAt: null,
					...(userId ? { userId } : {})
				},
				include: {
					services: {
						include: {
							service: true
						}
					},
					products: {
						include: {
							product: true
						}
					},
					client: true,
					user: true
				}
			});

			// Buscar agendamentos do período comparativo (mesmo período do mês anterior)
			const comparativeAppointments = await prisma.appointment.findMany({
				where: {
					companyId,
					scheduledTime: {
						gte: comparativeStartDate,
						lte: comparativeEndDate
					},
					deletedAt: null,
					...(userId ? { userId } : {})
				},
				include: {
					services: {
						include: {
							service: true
						}
					},
					products: {
						include: {
							product: true
						}
					},
					client: true,
					user: true
				}
			});

			// Filtrar apenas agendamentos concluídos para cálculos financeiros
			const completedAppointments = appointments.filter(app => app.status === AppointmentStatusEnum.COMPLETED);
			const comparativeCompletedAppointments = comparativeAppointments.filter(app => app.status === AppointmentStatusEnum.COMPLETED);

			// Calcular receita total do período atual
			const totalRevenue = completedAppointments.reduce((sum, app) => sum + app.value, 0);
			// Calcular receita total do período comparativo
			const comparativeTotalRevenue = comparativeCompletedAppointments.reduce((sum, app) => sum + app.value, 0);
			// Calcular tendência de crescimento
			const revenueTrend = this.calculateTrendPercentage(totalRevenue, comparativeTotalRevenue);

			// Calcular total de atendimentos concluídos em cada período
			const totalAppointments = completedAppointments.length;
			const comparativeTotalAppointments = comparativeCompletedAppointments.length;
			const appointmentsTrend = this.calculateTrendPercentage(totalAppointments, comparativeTotalAppointments);

			// Calcular total de serviços realizados em cada período
			const totalServices = completedAppointments.reduce((sum, app) => sum + app.services.length, 0);
			const comparativeTotalServices = comparativeCompletedAppointments.reduce((sum, app) => sum + app.services.length, 0);
			const servicesTrend = this.calculateTrendPercentage(totalServices, comparativeTotalServices);

			// Calcular clientes únicos em cada período
			const uniqueClientIds = [...new Set(completedAppointments.map(app => app.clientId))];
			const comparativeUniqueClientIds = [...new Set(comparativeCompletedAppointments.map(app => app.clientId))];
			const totalClients = uniqueClientIds.length;
			const comparativeTotalClients = comparativeUniqueClientIds.length;
			const clientsTrend = this.calculateTrendPercentage(totalClients, comparativeTotalClients);

			// Obter configuração de comissão do usuário (se especificado)
			let commissionPercentage = 20; // Valor padrão
			let commissionConfig;

			if (userId) {
				commissionConfig = await prisma.commissionConfig.findFirst({
					where: {
						companyId,
						userId,
						deletedAt: null
					}
				});

				if (commissionConfig?.commissionValue) {
					commissionPercentage = commissionConfig.commissionValue;
				}
			}

			// Calcular comissão atual e do período anterior
			const commission = (totalRevenue * commissionPercentage) / 100;
			const comparativeCommission = (comparativeTotalRevenue * commissionPercentage) / 100;
			const commissionTrend = this.calculateTrendPercentage(commission, comparativeCommission);

			// Buscar produtos vendidos no período atual
			const productsPeriod = period === 'today' ? 'day' : period;
			const productsSold = await this.getProductsSold(
				companyId,
				productsPeriod as any,
				startDate,
				endDate,
				userId
			);

			// Buscar produtos vendidos no período comparativo
			const comparativeStartDateStr = comparativeStartDate.toISOString().split('T')[0];
			const comparativeEndDateStr = comparativeEndDate.toISOString().split('T')[0];

			const comparativeProductsSold = await this.getProductsSold(
				companyId,
				'custom',
				comparativeStartDateStr,
				comparativeEndDateStr,
				userId
			);

			// Calcular tendência de produtos vendidos
			const productsSoldTrend = this.calculateTrendPercentage(
				productsSold.total || 0,
				comparativeProductsSold.total || 0
			);

			// Preparar estatísticas para retorno
			const stats: DashboardStats = {
				revenue: {
					total: totalRevenue,
					trend: revenueTrend,
					previousTotal: comparativeTotalRevenue
				},
				appointments: {
					total: totalAppointments,
					trend: appointmentsTrend,
					previousTotal: comparativeTotalAppointments
				},
				services: {
					total: totalServices,
					trend: servicesTrend,
					previousTotal: comparativeTotalServices
				},
				clients: {
					total: totalClients,
					trend: clientsTrend,
					previousTotal: comparativeTotalClients
				},
				commission: {
					total: commission,
					trend: commissionTrend,
					previousTotal: comparativeCommission
				},
				productsSold: {
					total: productsSold.total || 0,
					trend: productsSoldTrend,
					previousTotal: comparativeProductsSold.total || 0
				}
			};

			console.log('[StatisticsService] Dashboard stats calculadas:', stats);

			return stats;
		} catch (error) {
			console.error('[StatisticsService] Erro ao obter estatísticas do dashboard:', error);
			throw error;
		}
	}

	/**
	 * Obter próximos agendamentos
	 */
	async getUpcomingAppointments(companyId: number, limit: number = 5) {
		try {
			// Definir início e fim do dia atual
			const now = new Date();
			const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
			const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

			const appointments = await prisma.appointment.findMany({
				where: {
					companyId,
					scheduledTime: {
						gte: startOfDay,
						lte: endOfDay
					},
					status: { not: AppointmentStatusEnum.CANCELED },
					deletedAt: null
				},
				include: {
					client: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true
						}
					},
					services: {
						include: {
							service: true
						}
					}
				},
				orderBy: {
					scheduledTime: 'asc'
				},
				take: limit
			});

			return appointments;
		} catch (error) {
			console.error("Erro ao obter próximos agendamentos:", error);
			return [];
		}
	}

	/**
	 * Obter principais serviços
	 */
	async getTopServices(
		companyId: number,
		period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom' = 'month',
		userId?: number,
		startDate?: string,
		endDate?: string
	) {
		try {
			let periodStart: Date;
			let periodEnd: Date;

			try {
				// Verificar se as datas são strings válidas antes de manipular
				if (startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
					// CORREÇÃO DO FUSO HORÁRIO: Para o início do dia, usar 03:00:00 UTC (que corresponde a 00:00 em BRT)
					periodStart = new Date(`${startDate}T03:00:00.000Z`);
				} else {
					// Usar padrão: último mês
					periodStart = new Date();
					periodStart.setMonth(periodStart.getMonth() - 1);
					// Ajustar para o início do dia no UTC
					periodStart.setUTCHours(3, 0, 0, 0); // 00:00 BRT = 03:00 UTC
				}

				if (endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
					// CORREÇÃO DO FUSO HORÁRIO: Para o final do dia, usar 02:59:59 do dia seguinte em UTC
					const nextDay = new Date(endDate);
					nextDay.setDate(nextDay.getDate() + 1);
					periodEnd = new Date(`${nextDay.toISOString().split('T')[0]}T02:59:59.999Z`);
				} else {
					// Usar padrão: data atual no final do dia
					const today = new Date();
					const tomorrow = new Date(today);
					tomorrow.setDate(tomorrow.getDate() + 1);
					tomorrow.setUTCHours(2, 59, 59, 999); // 23:59:59 BRT = 02:59:59 UTC (dia seguinte)
					periodEnd = tomorrow;
				}

				console.log('==== TOP SERVICES - PROCESSAMENTO DE DATAS (AJUSTADO PARA UTC) ====');
				console.log('Data inicial (raw):', startDate);
				console.log('Data final (raw):', endDate);
				console.log('Data inicial (UTC ISO):', periodStart.toISOString());
				console.log('Data final (UTC ISO):', periodEnd.toISOString());
				console.log('Timezone offset (minutos):', new Date().getTimezoneOffset());
			} catch (err) {
				console.error('Erro ao processar datas, usando valores padrão:', err);
				// Em caso de erro, usar valores padrão
				periodStart = new Date();
				periodStart.setMonth(periodStart.getMonth() - 1);
				periodStart.setUTCHours(3, 0, 0, 0); // 00:00 BRT = 03:00 UTC

				const today = new Date();
				const tomorrow = new Date(today);
				tomorrow.setDate(tomorrow.getDate() + 1);
				tomorrow.setUTCHours(2, 59, 59, 999);
				periodEnd = tomorrow;
			}

			const where: any = {
				companyId,
				status: AppointmentStatusEnum.COMPLETED,
				scheduledTime: {
					gte: periodStart,
					lte: periodEnd
				},
				deletedAt: null
			};

			// Filtrar por usuário se especificado
			if (userId) {
				where.userId = userId;
			}

			const appointments = await prisma.appointment.findMany({
				where,
				include: {
					services: {
						include: {
							service: true
						}
					}
				}
			});

			// Imprimir todos os agendamentos encontrados para depuração
			console.log('Agendamentos encontrados para serviços:', appointments.map(app => ({
				id: app.id,
				date: app.scheduledTime,
				userId: app.userId,
				services: app.services.length
			})));

			// Agrupar serviços
			const serviceMap = new Map();

			appointments.forEach(appointment => {
				appointment.services.forEach(appService => {
					const service = appService.service;
					if (!serviceMap.has(service.id)) {
						serviceMap.set(service.id, {
							id: service.id,
							name: service.name,
							count: 0,
							revenue: 0,
							service: service.name,
							quantity: 0
						});
					}

					const serviceData = serviceMap.get(service.id);
					serviceData.count += 1;
					serviceData.quantity += 1;
					serviceData.revenue += service.price * appService.quantity;
				});
			});

			console.log('Top services:', {
				period: { start: periodStart, end: periodEnd },
				userId,
				appointments: appointments.length,
				services: serviceMap.size,
				serviceDetails: Array.from(serviceMap.values())
			});

			// Converter para array e ordenar por receita
			const services = Array.from(serviceMap.values())
				.sort((a, b) => b.revenue - a.revenue)
				.slice(0, 10); // Top 10 serviços

			return services;
		} catch (error) {
			console.error("Erro ao obter principais serviços:", error);
			return [];
		}
	}

	/**
	 * Obter comissões dos barbeiros
	 */
	async getBarberCommissions(
		companyId: number,
		period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom' = 'month',
		startDate?: string,
		endDate?: string
	) {
		try {
			// Definir datas de início e fim com base no período
			const { periodStart, periodEnd } = this.getPeriodDates(period, startDate, endDate);

			// Buscar todos os usuários da empresa
			const users = await prisma.user.findMany({
				where: {
					OR: [
						{
							companies: {
								some: {
									id: companyId,
									deletedAt: null
								}
							}
						},
						{
							companyMembers: {
								some: {
									companyId: companyId,
									deletedAt: null
								}
							}
						}
					],
					deletedAt: null
				}
			});

			let totalRevenue = 0;
			const result = [];

			for (const user of users) {
				// Buscar agendamentos concluídos do barbeiro no período com serviços incluídos
				const appointments = await prisma.appointment.findMany({
					where: {
						companyId,
						userId: user.id,
						status: AppointmentStatusEnum.COMPLETED,
						scheduledTime: {
							gte: periodStart,
							lte: periodEnd
						},
						deletedAt: null
					},
					include: {
						services: {
							include: {
								service: true
							}
						}
					}
				});

				// Imprimir appointments encontrados para cada barbeiro
				console.log(`Agendamentos encontrados para barbeiro ${user.name} (${user.id}):`, {
					periodo: { inicio: periodStart, fim: periodEnd },
					quantidadeAgendamentos: appointments.length,
					idsAgendamentos: appointments.map(a => a.id)
				});

				// Buscar configuração de comissão do barbeiro
				const commissionConfig = await prisma.commissionConfig.findFirst({
					where: {
						companyId,
						userId: user.id,
						deletedAt: null
					},
					include: {
						rules: {
							where: {
								deletedAt: null
							}
						}
					}
				});

				let totalCommission = 0;
				let revenue = 0;

				// Para cada agendamento
				for (const appointment of appointments) {
					revenue += appointment.value;

					// Para cada serviço no agendamento
					for (const serviceAppointment of appointment.services) {
						const { service, quantity } = serviceAppointment;
						const serviceValue = service.price * quantity;

						// Buscar regra específica para este serviço
						const serviceRule = commissionConfig?.rules?.find(rule => rule.serviceId === service.id);

						if (commissionConfig?.commissionType === 'SERVICES' && serviceRule) {
							// Se o tipo de comissão é por serviço e existe uma regra específica, usar ela
							const serviceCommission = (serviceValue * serviceRule.percentage) / 100;
							totalCommission += serviceCommission;
						} else if (commissionConfig?.commissionType === 'GENERAL') {
							// Se o tipo de comissão é geral, usar a comissão geral
							const serviceCommission = (serviceValue * (commissionConfig.commissionValue || 20)) / 100;
							totalCommission += serviceCommission;
						} else {
							// Se não tem nenhuma configuração, usar 20% como padrão
							const serviceCommission = (serviceValue * 20) / 100;
							totalCommission += serviceCommission;
						}
					}
				}

				totalRevenue += revenue;

				result.push({
					id: user.id,
					name: user.name,
					revenue,
					percentage: 0,
					appointmentCount: appointments.length,
					totalCommission
				});
			}

			// Calcular percentuais
			if (totalRevenue > 0) {
				for (const item of result) {
					item.percentage = parseFloat(((item.revenue / totalRevenue) * 100).toFixed(2));
				}
			}

			console.log('Barber commissions:', {
				period: { start: periodStart, end: periodEnd },
				barbers: result.length,
				barbersDetails: result.map(b => ({ 
					id: b.id, 
					name: b.name, 
					revenue: b.revenue, 
					appointments: b.appointmentCount,
					totalCommission: b.totalCommission 
				})),
				totalRevenue
			});

			return result;
		} catch (error) {
			console.error("Erro ao obter comissões dos barbeiros:", error);
			return [];
		}
	}

	/**
	 * Obter contagem de agendamentos de um barbeiro no período
	 */
	async getBarberAppointmentCount(
		companyId: number,
		userId: number,
		startDate: Date,
		endDate: Date
	): Promise<number> {
		try {
			// Garantir que a data final tenha o horário até o final do dia
			const adjustedEndDate = new Date(endDate);
			adjustedEndDate.setHours(23, 59, 59, 999);

			const appointmentsCount = await prisma.appointment.count({
				where: {
					companyId,
					userId,
					status: AppointmentStatusEnum.COMPLETED,
					scheduledTime: {
						gte: startDate,
						lte: adjustedEndDate
					},
					deletedAt: null
				}
			});

			return appointmentsCount;
		} catch (error) {
			console.error("Erro ao contar agendamentos do barbeiro:", error);
			return 0;
		}
	}

	/**
	 * Obter configuração de comissão de um barbeiro
	 */
	async getBarberCommissionConfig(
		companyId: number,
		userId: number
	) {
		try {
			const commissionConfig = await prisma.commissionConfig.findFirst({
				where: {
					companyId,
					userId,
					deletedAt: null
				},
				include: {
					rules: {
						where: {
							deletedAt: null
						}
					}
				}
			});

			return commissionConfig;
		} catch (error) {
			console.error("Erro ao buscar configuração de comissão do barbeiro:", error);
			return null;
		}
	}

	/**
	 * Obter produtos vendidos no período
	 */
	async getProductsSold(
		companyId: number,
		period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom' = 'month',
		startDate?: string,
		endDate?: string,
		userId?: number
	): Promise<{ total: number, trend: number, previousTotal: number }> {
		try {
			// Log para depuração
			console.log('==== CHAMADA GETPRODUCTSSOLD - PARÂMETROS RECEBIDOS ====');
			console.log('companyId:', companyId);
			console.log('period:', period);
			console.log('startDate (raw):', startDate);
			console.log('endDate (raw):', endDate);
			console.log('userId:', userId);

			// Criar datas que correspondem ao início e final dos dias especificados
			let currentPeriodStartDate: Date;
			let currentPeriodEndDate: Date;

			try {
				// Verificar se as datas são strings válidas antes de manipular
				if (startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
					// CORREÇÃO DO FUSO HORÁRIO: Para o início do dia, usar 03:00:00 UTC (que corresponde a 00:00 em BRT)
					currentPeriodStartDate = new Date(`${startDate}T03:00:00.000Z`);
				} else {
					// Usar padrão: último mês
					currentPeriodStartDate = new Date();
					currentPeriodStartDate.setMonth(currentPeriodStartDate.getMonth() - 1);
					// Ajustar para o início do dia no UTC
					currentPeriodStartDate.setUTCHours(3, 0, 0, 0); // 00:00 BRT = 03:00 UTC
				}

				if (endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
					// CORREÇÃO DO FUSO HORÁRIO: Para o final do dia, usar 02:59:59 do dia seguinte em UTC
					const nextDay = new Date(endDate);
					nextDay.setDate(nextDay.getDate() + 1);
					currentPeriodEndDate = new Date(`${nextDay.toISOString().split('T')[0]}T02:59:59.999Z`);
				} else {
					// Usar padrão: data atual no final do dia
					const today = new Date();
					const tomorrow = new Date(today);
					tomorrow.setDate(tomorrow.getDate() + 1);
					tomorrow.setUTCHours(2, 59, 59, 999); // 23:59:59 BRT = 02:59:59 UTC (dia seguinte)
					currentPeriodEndDate = tomorrow;
				}

				// Depuração detalhada sobre o processamento de datas
				console.log('==== DETALHES DE PROCESSAMENTO DE DATAS - AJUSTADO PARA UTC ====');
				console.log('Data inicial (raw):', startDate);
				console.log('Data final (raw):', endDate);
				console.log('Data inicial (UTC ISO):', currentPeriodStartDate.toISOString());
				console.log('Data final (UTC ISO):', currentPeriodEndDate.toISOString());
				console.log('Timezone offset (minutos):', new Date().getTimezoneOffset());
			} catch (err) {
				console.error('Erro ao processar datas, usando valores padrão:', err);
				// Em caso de erro, usar valores padrão
				currentPeriodStartDate = new Date();
				currentPeriodStartDate.setMonth(currentPeriodStartDate.getMonth() - 1);
				currentPeriodStartDate.setUTCHours(3, 0, 0, 0); // 00:00 BRT = 03:00 UTC

				const today = new Date();
				const tomorrow = new Date(today);
				tomorrow.setDate(tomorrow.getDate() + 1);
				tomorrow.setUTCHours(2, 59, 59, 999);
				currentPeriodEndDate = tomorrow;
			}

			// Período anterior (mesmo número de dias)
			const dayDiff = Math.ceil((currentPeriodEndDate.getTime() - currentPeriodStartDate.getTime()) / (1000 * 60 * 60 * 24));
			const prevPeriodEndDate = new Date(currentPeriodStartDate);
			prevPeriodEndDate.setDate(prevPeriodEndDate.getDate() - 1);
			const prevPeriodStartDate = new Date(prevPeriodEndDate);
			prevPeriodStartDate.setDate(prevPeriodStartDate.getDate() - dayDiff);

			// Preparar a condição de filtro baseada no userId
			const userFilter = userId ? { userId } : {};

			// Buscar agendamentos concluídos no período atual diretamente com as datas em UTC
			const currentAppointments = await prisma.appointment.findMany({
				where: {
					companyId,
					...userFilter,
					status: AppointmentStatusEnum.COMPLETED,
					scheduledTime: {
						gte: currentPeriodStartDate,
						lte: currentPeriodEndDate
					},
					deletedAt: null
				},
				include: {
					products: {
						include: {
							product: true
						}
					},
					client: true,
					user: true
				}
			});

			// Imprimir IDs dos agendamentos e produtos para depuração (formato simplificado para evitar erros)
			console.log('==== AGENDAMENTOS ENCONTRADOS ====');
			console.log('Total de agendamentos:', currentAppointments.length);

			// Exibir detalhes completos dos agendamentos encontrados
			console.log('==== DETALHES COMPLETOS DOS AGENDAMENTOS ====');
			for (const app of currentAppointments) {
				console.log(`
====================================
AGENDAMENTO ID: ${app.id}
Valor: R$ ${app.value}
Status: ${app.status}
Data Agendada: ${app.scheduledTime}
Cliente: ${app.client?.name || 'N/A'} (ID: ${app.clientId})
Barbeiro: ${app.user?.name || 'N/A'} (ID: ${app.userId})
Produtos associados: ${app.products.length}
====================================
				`);

				if (app.products.length > 0) {
					console.log('Produtos deste agendamento:');
					for (const product of app.products) {
						console.log(`- ID: ${product.id}, Produto ID: ${product.productId}, Produto: ${product.product.name}, Quantidade: ${product.quantity}`);
					}
				}
			}

			// Buscar agendamentos concluídos no período anterior
			const prevAppointments = await prisma.appointment.findMany({
				where: {
					companyId,
					...userFilter,
					status: AppointmentStatusEnum.COMPLETED,
					scheduledTime: {
						gte: prevPeriodStartDate,
						lte: prevPeriodEndDate
					},
					deletedAt: null
				},
				include: {
					products: true
				}
			});

			// Calcular total de produtos vendidos
			let currentTotal = 0;
			let produtosContabilizados = [];

			for (const app of currentAppointments) {
				for (const product of app.products) {
					const quantidade = product.quantity || 1; // Se quantity for null/undefined, assume 1
					currentTotal += quantidade;

					produtosContabilizados.push({
						agendamentoId: app.id,
						produtoId: product.productId,
						nome: product.product?.name || "Produto desconhecido",
						quantidade,
						subtotal: quantidade
					});
				}
			}

			console.log('==== PRODUTOS CONTABILIZADOS ====');
			console.log(JSON.stringify(produtosContabilizados, null, 2));
			console.log(`Total de produtos somando quantidades: ${currentTotal}`);

			let prevTotal = 0;
			for (const app of prevAppointments) {
				for (const product of app.products) {
					prevTotal += product.quantity || 1; // Se quantity for null/undefined, assume 1
				}
			}

			console.log('==== RESULTADO FINAL ====');
			console.log('total de produtos atual:', currentTotal);
			console.log('total de produtos anterior:', prevTotal);
			console.log('período atual:', {
				inicio: currentPeriodStartDate.toLocaleDateString(),
				fim: currentPeriodEndDate.toLocaleDateString()
			});

			// Calcular tendência
			let trend = 0;
			if (prevTotal > 0) {
				trend = Math.min(Math.max(((currentTotal - prevTotal) / prevTotal) * 100, -100), 1000);
				trend = Math.round(trend * 10) / 10; // Arredondar para 1 casa decimal
			} else if (currentTotal > 0) {
				trend = 100;
			}

			// Adicionar uma verificação explícita para produtos de agendamentos
			console.log('==== VERIFICAÇÃO ADICIONAL DE PRODUTOS ====');
			for (const app of currentAppointments) {
				// Buscar produtos diretamente da tabela ProductAppointment
				const productDetails = await prisma.productAppointment.findMany({
					where: {
						appointmentId: app.id
					},
					include: {
						product: true
					}
				});

				console.log(`Agendamento ${app.id}, produtos encontrados diretamente: ${productDetails.length}`);
				if (productDetails.length > 0) {
					for (const p of productDetails) {
						console.log(`- Produto ID: ${p.productId}, Nome: ${p.product?.name || 'Desconhecido'}, Quantidade: ${p.quantity}`);
					}
				}
			}

			// Verificação adicional: Buscar todos os ProductAppointment no período
			console.log('==== VERIFICAÇÃO DIRETA NA TABELA DE PRODUTOS ====');

			// Buscar todos os IDs de agendamentos no período
			const appointmentIds = currentAppointments.map(app => app.id);

			// Buscar todos os ProductAppointment para esses agendamentos
			const allProductAppointments = await prisma.productAppointment.findMany({
				where: {
					appointmentId: {
						in: appointmentIds
					}
				},
				include: {
					product: true,
					appointment: true
				}
			});

			console.log(`Total de registros ProductAppointment encontrados: ${allProductAppointments.length}`);
			for (const entry of allProductAppointments) {
				console.log(`
					ProductAppointment ID: ${entry.id}
					Agendamento ID: ${entry.appointmentId}
					Produto ID: ${entry.productId}
					Produto: ${entry.product?.name || 'N/A'}
					Quantidade: ${entry.quantity}
					Status do Agendamento: ${entry.appointment?.status || 'N/A'}
				`);
			}

			// Verificação adicional 2: Buscar diretamente todos os produtos vendidos, ignorando filtros
			console.log('==== TODOS OS PRODUTOS DOS ÚLTIMOS AGENDAMENTOS ====');

			// Buscar todos os agendamentos da empresa (últimos 10)
			const recentAppointments = await prisma.appointment.findMany({
				where: {
					companyId,
					status: AppointmentStatusEnum.COMPLETED,
					deletedAt: null
				},
				orderBy: {
					scheduledTime: 'desc'
				},
				take: 10,
				include: {
					products: {
						include: {
							product: true
						}
					},
					client: true
				}
			});

			// Imprimir detalhes dos produtos destes agendamentos
			console.log(`Encontrados ${recentAppointments.length} agendamentos recentes`);
			for (const app of recentAppointments) {
				console.log(`
					Agendamento ID: ${app.id}
					Data: ${app.scheduledTime}
					Cliente: ${app.client?.name || 'N/A'}
					Status: ${app.status}
					Produtos: ${app.products.length}
				`);

				for (const product of app.products) {
					console.log(`- Produto: ${product.product?.name || 'N/A'}, Quantidade: ${product.quantity}`);
				}
			}

			return {
				total: currentTotal,
				trend,
				previousTotal: prevTotal
			};
		} catch (error) {
			console.error("Erro ao buscar produtos vendidos:", error);
			return {
				total: 0,
				trend: 0,
				previousTotal: 0
			};
		}
	}

	/**
	 * Obter agendamentos pendentes
	 * @param companyId ID da empresa
	 * @returns Lista de agendamentos pendentes
	 */
	async getPendingAppointments(companyId: number): Promise<any[]> {
		console.log(`Buscando agendamentos pendentes para a empresa ${companyId}`);
		try {
			// Buscar agendamentos com status PENDING
			const pendingAppointments = await prisma.appointment.findMany({
				where: {
					companyId,
					status: 'PENDING'
				},
				include: {
					client: {
						select: {
							id: true,
							name: true,
							phone: true
						}
					},
					services: {
						include: {
							service: true
						}
					},
					products: {
						include: {
							product: true
						}
					},
					user: {
						select: {
							id: true,
							name: true
						}
					}
				},
				orderBy: {
					scheduledTime: 'asc'
				}
			});

			console.log(`Encontrados ${pendingAppointments.length} agendamentos pendentes`);
			return pendingAppointments;
		} catch (error) {
			console.error('Erro ao buscar agendamentos pendentes:', error);
			throw new Error('Erro ao buscar agendamentos pendentes');
		}
	}

	/**
	 * Calcula o período comparativo (mesmo período do mês anterior)
	 */
	calculateComparativePeriod(startDate: string | Date, endDate: string | Date): { comparativeStartDate: Date, comparativeEndDate: Date } {
		// Converter para Date se for string
		const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate);
		const end = typeof endDate === 'string' ? new Date(endDate) : new Date(endDate);

		// Calcular o mesmo período do mês anterior
		const comparativeStartDate = new Date(start);
		comparativeStartDate.setMonth(start.getMonth() - 1);

		const comparativeEndDate = new Date(end);
		comparativeEndDate.setMonth(end.getMonth() - 1);

		// Ajustar se o dia do mês anterior exceder o limite (ex: 31 de janeiro para 28 de fevereiro)
		// Isso já é ajustado automaticamente pelo JavaScript

		return { comparativeStartDate, comparativeEndDate };
	}

	/**
	 * Calcula a porcentagem de crescimento entre dois valores
	 */
	calculateTrendPercentage(currentValue: number, previousValue: number): number {
		if (previousValue === 0) return currentValue > 0 ? 100 : 0;

		const difference = currentValue - previousValue;
		const percentage = (difference / Math.abs(previousValue)) * 100;

		// Limitar a 2 casas decimais
		return Math.round(percentage * 100) / 100;
	}

	private getPeriodDates(
		period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom' = 'month',
		startDate?: string,
		endDate?: string
	): { periodStart: Date; periodEnd: Date } {
		let periodStart: Date;
		let periodEnd: Date;

		try {
			// Verificar se as datas são strings válidas antes de manipular
			if (startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
				// CORREÇÃO DO FUSO HORÁRIO: Para o início do dia, usar 03:00:00 UTC (que corresponde a 00:00 em BRT)
				periodStart = new Date(`${startDate}T03:00:00.000Z`);
			} else {
				// Usar padrão: último mês
				periodStart = new Date();
				periodStart.setMonth(periodStart.getMonth() - 1);
				// Ajustar para o início do dia no UTC
				periodStart.setUTCHours(3, 0, 0, 0); // 00:00 BRT = 03:00 UTC
			}

			if (endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
				// CORREÇÃO DO FUSO HORÁRIO: Para o final do dia, usar 02:59:59 do dia seguinte em UTC
				const nextDay = new Date(endDate);
				nextDay.setDate(nextDay.getDate() + 1);
				periodEnd = new Date(`${nextDay.toISOString().split('T')[0]}T02:59:59.999Z`);
			} else {
				// Usar padrão: data atual no final do dia
				const today = new Date();
				const tomorrow = new Date(today);
				tomorrow.setDate(tomorrow.getDate() + 1);
				tomorrow.setUTCHours(2, 59, 59, 999); // 23:59:59 BRT = 02:59:59 UTC (dia seguinte)
				periodEnd = tomorrow;
			}

			console.log('==== BARBER COMMISSIONS - PROCESSAMENTO DE DATAS (AJUSTADO PARA UTC) ====');
			console.log('Data inicial (raw):', startDate);
			console.log('Data final (raw):', endDate);
			console.log('Data inicial (UTC ISO):', periodStart.toISOString());
			console.log('Data final (UTC ISO):', periodEnd.toISOString());
			console.log('Timezone offset (minutos):', new Date().getTimezoneOffset());

			return { periodStart, periodEnd };
		} catch (err) {
			console.error('Erro ao processar datas, usando valores padrão:', err);
			// Em caso de erro, usar valores padrão
			periodStart = new Date();
			periodStart.setMonth(periodStart.getMonth() - 1);
			periodStart.setUTCHours(3, 0, 0, 0); // 00:00 BRT = 03:00 UTC

			const today = new Date();
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);
			tomorrow.setUTCHours(2, 59, 59, 999);
			periodEnd = tomorrow;

			return { periodStart, periodEnd };
		}
	}
} 