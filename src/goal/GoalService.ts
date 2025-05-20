import prisma from '../config/db/db';

export interface CreateGoal {
	userId: number;
	companyId: number;
	month: number;
	year: number;
	target: number;
}

export class GoalService {
	// Check if a goal already exists for this user, month, and year
	async checkGoalExists(userId: number, companyId: number, month: number, year: number): Promise<boolean> {
		console.log(`Verificando meta existente para userId: ${userId}, companyId: ${companyId}, month: ${month}, year: ${year}`);

		// Buscar exatamente pela combinação de userId, companyId, month e year
		const existingGoal = await prisma.goal.findFirst({
			where: {
				AND: [
					{ userId: Number(userId) },
					{ companyId: Number(companyId) },
					{ month: Number(month) },
					{ year: Number(year) }
				],
				deletedAt: null
			}
		});

		if (existingGoal) {
			console.log('Meta existente encontrada:', JSON.stringify(existingGoal));
		} else {
			console.log('Nenhuma meta encontrada com esses parâmetros exatos');
		}

		// Verificar outras metas do usuário para debug
		const userGoals = await prisma.goal.findMany({
			where: {
				userId: Number(userId),
				deletedAt: null
			},
			select: {
				id: true,
				month: true,
				year: true,
				companyId: true
			}
		});

		console.log(`Total de ${userGoals.length} metas encontradas para o usuário ${userId}:`,
			JSON.stringify(userGoals));

		return !!existingGoal;
	}

	async createGoal(data: CreateGoal): Promise<any> {
		return await prisma.goal.create({
			data: {
				userId: data.userId,
				companyId: data.companyId,
				month: data.month,
				year: data.year,
				target: data.target
			},
			include: {
				user: true,
				company: true
			}
		});
	}

	async getAllGoals(companyId: number): Promise<any> {
		return await prisma.goal.findMany({
			where: {
				companyId: companyId,
				deletedAt: null
			},
			include: {
				user: true,
				company: true
			}
		});
	}

	async getUserGoals(userId: number): Promise<any> {
		return await prisma.goal.findMany({
			where: {
				userId: userId,
				deletedAt: null
			},
			include: {
				user: true,
				company: true
			}
		});
	}

	async getGoalById(goalId: number): Promise<any> {
		return await prisma.goal.findUnique({
			where: {
				id: goalId,
				deletedAt: null
			},
			include: {
				user: true,
				company: true
			}
		});
	}

	async updateGoal(id: number, data: Partial<CreateGoal>): Promise<any> {
		return await prisma.goal.update({
			where: {
				id,
				deletedAt: null
			},
			data: {
				month: data.month,
				year: data.year,
				target: data.target
			},
			include: {
				user: true,
				company: true
			}
		});
	}

	async deleteGoal(id: number): Promise<any> {
		return await prisma.goal.update({
			where: {
				id,
				deletedAt: null
			},
			data: {
				deletedAt: new Date()
			}
		});
	}

	// Calculate progress for a specific goal
	async getGoalProgress(goalId: number, customStartDate?: Date, customEndDate?: Date): Promise<number> {
		const goal = await this.getGoalById(goalId);
		if (!goal) return 0;

		// Get all completed appointments for this user in the specified month and year
		// Use custom date range if provided, otherwise use goal's month/year
		const startDate = customStartDate || new Date(goal.year, goal.month - 1, 1);
		const endDate = customEndDate || new Date(goal.year, goal.month, 0); // Last day of the month

		// Add more logs for debugging
		console.log(`Calculating progress for goal ${goalId}, user ${goal.userId}, company ${goal.companyId}`);
		console.log(`Using date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

		const appointments = await prisma.appointment.findMany({
			where: {
				userId: goal.userId,
				companyId: goal.companyId,
				status: 'COMPLETED',
				scheduledTime: {
					gte: startDate,
					lte: endDate
				},
				deletedAt: null
			}
		});

		console.log(`Found ${appointments.length} completed appointments for user ${goal.userId}`);

		// Sum up the values of all completed appointments
		const totalValue = appointments.reduce((sum, appointment) => sum + appointment.value, 0);
		console.log(`Total value: ${totalValue}`);

		return totalValue;
	}

	// Calculate progress for multiple goals
	async getGoalsProgress(goalIds: number[], customStartDate?: Date, customEndDate?: Date): Promise<Record<number, number>> {
		const progress: Record<number, number> = {};

		await Promise.all(
			goalIds.map(async (goalId) => {
				progress[goalId] = await this.getGoalProgress(goalId, customStartDate, customEndDate);
			})
		);

		return progress;
	}

	async getGoalsByMonthAndYear(companyId: number, month: number, year: number): Promise<any> {
		return await prisma.goal.findMany({
			where: {
				companyId,
				month,
				year,
				deletedAt: null
			},
			include: {
				user: true,
				company: true
			}
		});
	}

	async getUserGoalsByMonthAndYear(userId: number, month: number, year: number): Promise<any> {
		return await prisma.goal.findMany({
			where: {
				userId,
				month,
				year,
				deletedAt: null
			},
			include: {
				user: true,
				company: true
			}
		});
	}
} 