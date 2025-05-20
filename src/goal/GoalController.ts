import { Request, Response } from 'express';
import { GoalService } from './GoalService';
import { CompanyService } from '../company/CompanyService';
import { CompanyMember } from '@prisma/client';
import { PermissionService } from '../permission/PermissionService';

const goalService = new GoalService();
const companyService = new CompanyService();
const permissionService = new PermissionService();

export class GoalController {
	static async createGoal(req: Request, res: Response): Promise<void> {
		const { companyId, month, year, target, userId: targetUserId } = req.body;
		const loggedUserId = req.userId;

		try {
			if (!loggedUserId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			console.log('Dados de criação da meta (antes da conversão):', {
				companyId,
				month,
				year,
				target,
				targetUserId,
				loggedUserId
			});

			// Converter para números e validar
			const companyIdNum = Number(companyId);
			const monthNum = Number(month);
			const yearNum = Number(year);
			const targetNum = Number(target);
			const userIdNum = Number(targetUserId || loggedUserId);

			console.log('Dados de criação da meta (após conversão):', {
				companyId: companyIdNum,
				month: monthNum,
				year: yearNum,
				target: targetNum,
				userId: userIdNum,
				loggedUserId
			});

			if (!companyIdNum || !monthNum || !yearNum || !targetNum) {
				res.status(400).json({
					message: 'Todos os campos são obrigatórios e devem ser valores numéricos válidos',
					receivedValues: { companyId, month, year, target }
				});
				return;
			}

			// Validate month
			if (monthNum < 1 || monthNum > 12) {
				res.status(400).json({ message: 'Mês inválido: deve estar entre 1 e 12' });
				return;
			}

			// Check if user belongs to company
			const company = await companyService.getCompanyById(companyIdNum);
			if (!company || (company.ownerId !== loggedUserId && !company.members.some((member: CompanyMember) => member.userId === loggedUserId))) {
				res.status(403).json({ message: 'Você não tem permissão para criar metas nesta empresa' });
				return;
			}

			// Check if a goal already exists for this user/month/year
			const goalExists = await goalService.checkGoalExists(userIdNum, companyIdNum, monthNum, yearNum);
			if (goalExists) {
				res.status(400).json({
					message: `Já existe uma meta para o usuário ${userIdNum} no mês ${monthNum}/${yearNum}`,
					details: { userId: userIdNum, companyId: companyIdNum, month: monthNum, year: yearNum }
				});
				return;
			}

			const goal = await goalService.createGoal({
				userId: userIdNum,
				companyId: companyIdNum,
				month: monthNum,
				year: yearNum,
				target: targetNum
			});

			console.log('Meta criada com sucesso:', JSON.stringify(goal));
			res.status(201).json(goal);
		} catch (error) {
			console.error('Erro ao criar meta:', error);
			if (error instanceof Error) {
				res.status(422).json({ message: error.message });
			} else {
				res.status(400).json({ message: 'Erro inesperado ao criar meta' });
			}
		}
	}

	static async getAllGoals(req: Request, res: Response): Promise<void> {
		const { companyId, month, year } = req.query;
		const userId = req.userId;

		try {
			if (!userId || !companyId) {
				res.status(400).json({ message: 'Parâmetros inválidos: companyId é obrigatório' });
				return;
			}

			if (!month || !year) {
				res.status(400).json({ message: 'Parâmetros inválidos: month e year são obrigatórios' });
				return;
			}

			// Validar mês e ano
			const monthValue = parseInt(month as string);
			const yearValue = parseInt(year as string);

			if (isNaN(monthValue) || monthValue < 1 || monthValue > 12) {
				res.status(400).json({ message: 'Mês inválido: deve ser um número entre 1 e 12' });
				return;
			}

			if (isNaN(yearValue) || yearValue < 2000 || yearValue > 2100) {
				res.status(400).json({ message: 'Ano inválido: deve ser um número entre 2000 e 2100' });
				return;
			}

			const company = await companyService.getCompanyById(Number(companyId));
			if (!company || (company.ownerId !== userId && !company.members.some((member: CompanyMember) => member.userId === userId))) {
				res.status(403).json({ message: 'Você não tem permissão para visualizar metas desta empresa' });
				return;
			}

			const goals = await goalService.getGoalsByMonthAndYear(
				Number(companyId),
				monthValue,
				yearValue
			);

			res.status(200).json(goals);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao obter metas', error });
		}
	}

	static async getUserGoals(req: Request, res: Response): Promise<void> {
		const { month, year } = req.query;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Usuário não encontrado' });
				return;
			}

			if (!month || !year) {
				res.status(400).json({ message: 'Parâmetros inválidos: month e year são obrigatórios' });
				return;
			}

			// Validar mês e ano
			const monthValue = parseInt(month as string);
			const yearValue = parseInt(year as string);

			if (isNaN(monthValue) || monthValue < 1 || monthValue > 12) {
				res.status(400).json({ message: 'Mês inválido: deve ser um número entre 1 e 12' });
				return;
			}

			if (isNaN(yearValue) || yearValue < 2000 || yearValue > 2100) {
				res.status(400).json({ message: 'Ano inválido: deve ser um número entre 2000 e 2100' });
				return;
			}

			const goals = await goalService.getUserGoalsByMonthAndYear(userId, monthValue, yearValue);
			res.status(200).json(goals);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao obter metas do usuário', error });
		}
	}

	static async getGoalById(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Usuário não encontrado' });
				return;
			}

			const goal = await goalService.getGoalById(parseInt(id));

			if (!goal) {
				res.status(404).json({ message: 'Meta não encontrada' });
				return;
			}

			// Check if user has permission to view this goal
			const company = await companyService.getCompanyById(goal.companyId);
			if (!company || (company.ownerId !== userId && !company.members.some((member: CompanyMember) => member.userId === userId))) {
				res.status(403).json({ message: 'Você não tem permissão para visualizar esta meta' });
				return;
			}

			res.status(200).json(goal);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao obter meta', error });
		}
	}

	static async updateGoal(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const userId = req.userId;
		const updateData = req.body;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Usuário não encontrado' });
				return;
			}

			const goal = await goalService.getGoalById(parseInt(id));

			if (!goal) {
				res.status(404).json({ message: 'Meta não encontrada' });
				return;
			}

			// Check if user has permission to update this goal
			const company = await companyService.getCompanyById(goal.companyId);
			if (!company || (company.ownerId !== userId && !company.members.some((member: CompanyMember) => member.userId === userId))) {
				res.status(403).json({ message: 'Você não tem permissão para atualizar esta meta' });
				return;
			}

			// If month or year is being updated, check if a goal already exists for the new month/year
			if ((updateData.month && updateData.month !== goal.month) ||
				(updateData.year && updateData.year !== goal.year)) {

				const newMonth = updateData.month || goal.month;
				const newYear = updateData.year || goal.year;

				const goalExists = await goalService.checkGoalExists(goal.userId, goal.companyId, newMonth, newYear);
				if (goalExists) {
					res.status(400).json({ message: 'Já existe uma meta para este usuário neste mês e ano' });
					return;
				}
			}

			const updatedGoal = await goalService.updateGoal(parseInt(id), updateData);
			res.status(200).json(updatedGoal);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao atualizar meta', error });
		}
	}

	static async deleteGoal(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Usuário não encontrado' });
				return;
			}

			const goal = await goalService.getGoalById(parseInt(id));

			if (!goal) {
				res.status(404).json({ message: 'Meta não encontrada' });
				return;
			}

			// Check if user has permission to delete this goal
			const company = await companyService.getCompanyById(goal.companyId);
			if (!company || (company.ownerId !== userId && !company.members.some((member: CompanyMember) => member.userId === userId))) {
				res.status(403).json({ message: 'Você não tem permissão para deletar esta meta' });
				return;
			}

			await goalService.deleteGoal(parseInt(id));
			res.status(200).json({ message: 'Meta deletada com sucesso' });
		} catch (error) {
			res.status(500).json({ message: 'Erro ao deletar meta', error });
		}
	}

	static async getGoalProgress(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Usuário não encontrado' });
				return;
			}

			const goal = await goalService.getGoalById(parseInt(id));

			if (!goal) {
				res.status(404).json({ message: 'Meta não encontrada' });
				return;
			}

			// Buscar permissões do usuário
			const userPermissions = await permissionService.getUserPermissions(userId);
			const hasViewAllGoals = userPermissions?.viewAllGoals || false;
			const hasViewOwnGoals = userPermissions?.viewOwnGoals || false;

			// Verificar permissões para acessar o progresso da meta
			// Permissão viewAllGoals já é verificada pelo middleware, mas precisamos
			// verificar se o usuário pode ver suas próprias metas
			if (!hasViewAllGoals) {
				// Verifica se é o dono da meta E tem permissão para ver suas próprias metas
				if (goal.userId === userId && hasViewOwnGoals) {
					// Permitido: é sua própria meta e tem permissão para ver suas metas
				} else {
					// Se não tem permissão viewAllGoals nem é dono da meta com viewOwnGoals,
					// verifica se é dono ou membro da empresa
					const company = await companyService.getCompanyById(goal.companyId);
					if (!company || (company.ownerId !== userId &&
						!company.members.some((member: CompanyMember) => member.userId === userId))) {
						res.status(403).json({ message: 'Você não tem permissão para visualizar o progresso desta meta' });
						return;
					}
				}
			}

			const progress = await goalService.getGoalProgress(parseInt(id));
			res.status(200).json(progress);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao obter progresso da meta', error });
		}
	}

	static async getGoalsProgress(req: Request, res: Response): Promise<void> {
		const { goalIds, startDate, endDate } = req.body;
		const userId = req.userId;

		try {
			if (!userId || !goalIds || !Array.isArray(goalIds)) {
				res.status(400).json({ message: 'Parâmetros inválidos' });
				return;
			}

			// Parse date strings to Date objects if provided
			const customStartDate = startDate ? new Date(startDate) : undefined;
			const customEndDate = endDate ? new Date(endDate) : undefined;

			// Log request details for debugging
			console.log(`Getting progress for goals: ${goalIds.join(', ')}`);
			console.log(`Date range: ${customStartDate?.toISOString() || 'default'} to ${customEndDate?.toISOString() || 'default'}`);

			// Buscar permissões do usuário
			const userPermissions = await permissionService.getUserPermissions(userId);
			const hasViewAllGoals = userPermissions?.viewAllGoals || false;
			const hasViewOwnGoals = userPermissions?.viewOwnGoals || false;

			// Verificar permissões para cada meta
			for (const goalId of goalIds) {
				const goal = await goalService.getGoalById(goalId);
				if (!goal) continue;

				const company = await companyService.getCompanyById(goal.companyId);

				// Se o usuário não tem permissão para visualizar todas as metas,
				// verificamos se é uma meta dele próprio e se ele tem permissão para ver suas próprias metas
				if (!hasViewAllGoals) {
					// Se não é o dono da meta ou não tem permissão para ver suas próprias metas
					if (goal.userId !== userId || !hasViewOwnGoals) {
						// Se também não é dono ou membro da empresa
						if (!company || (company.ownerId !== userId &&
							!company.members.some((member: CompanyMember) => member.userId === userId))) {
							res.status(403).json({
								message: 'Você não tem permissão para visualizar o progresso de uma ou mais metas'
							});
							return;
						}
					}
				}
			}

			const progress = await goalService.getGoalsProgress(goalIds, customStartDate, customEndDate);
			res.status(200).json(progress);
		} catch (error) {
			console.error('Erro ao obter progresso das metas:', error);
			res.status(500).json({ message: 'Erro ao obter progresso das metas', error });
		}
	}
} 