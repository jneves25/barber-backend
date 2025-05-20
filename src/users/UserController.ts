import { Request, Response } from 'express';
import { UserService } from './UserService';
import { CompanyService } from '../company/CompanyService';
import { CompanyMemberService } from '../company-member/CompanyMemberService';
import { PermissionService } from '../permission/PermissionService';
import { RoleEnum } from '@prisma/client';
import { CommissionService } from '../commission/CommissionService';
import { GoalService } from '../goal/GoalService';
import { ServiceService } from '../service/ServiceService';

const userService = new UserService();
const companyService = new CompanyService();
const companyMemberService = new CompanyMemberService();
const permissionService = new PermissionService();
const commissionService = new CommissionService();
const goalService = new GoalService();
const serviceService = new ServiceService();

export class UserController {
	static async createUser(req: Request, res: Response): Promise<void> {
		const { email, name, role, password, companyId } = req.body;
		const userId = req.userId || undefined;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			if (!companyId) {
				res.status(404).json({ message: 'Empresa não informada' });
				return;
			}

			const newUser = await userService.createUserWithPermissions(
				{ email, name, password, role }
			);

			if (!newUser) {
				res.status(400).json({ message: 'Falha ao cadastrar dados do usuário' });
				return;
			}

			// Adiciona permissoes ao usuario de acordo com a role dele
			await permissionService.assignPermissionsToUser(newUser.id, newUser.role, newUser.permissions);

			// Adiciona o usuario criado ao time do usuario admin
			await companyMemberService.addMemberToCompany(companyId, newUser.id);

			// Cria a configuração padrão de comissão
			const commissionConfig = await commissionService.createDefaultCommissionConfig(newUser.id, companyId);

			// Busca todos os serviços existentes
			const services = await serviceService.getAllServices(companyId);

			// Cria uma regra de comissão para cada serviço
			for (const service of services) {
				await commissionService.createCommissionRule({
					configId: commissionConfig.id,
					serviceId: service.id,
					serviceType: 'PERCENTAGE',
					percentage: 40 // Valor padrão de 40%
				});
			}

			// Add goals from current month until end of year
			const currentDate = new Date();
			const currentMonth = currentDate.getMonth() + 1;
			const currentYear = currentDate.getFullYear();

			for (let month = currentMonth; month <= 12; month++) {
				await goalService.createGoal({
					userId: newUser.id,
					companyId: companyId,
					month: month,
					year: currentYear,
					target: 0 // Default target value
				});
			}

			res.status(201).json(newUser);
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro inesperado ao criar usuário', error });
			}
		}
	}

	static async getUsers(req: Request, res: Response) {
		try {
			const users = await userService.getAllUsers();
			res.status(200).json(users);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar usuários', error });
		}
	}

	static async getUserInfo(req: Request, res: Response) {
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const user = await userService.getUserById(userId);

			if (user) {
				res.status(200).json(user);
			} else {
				res.status(404).json({ message: 'Usuário não encontrado' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar usuário', error });
		}
	}

	static async getUserById(req: Request, res: Response) {
		const { id } = req.params;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			if (!id) {
				res.status(400).json({ message: 'ID do usuário não fornecido!' });
				return;
			}

			const loggedUser = await userService.getUserById(userId);

			if (!loggedUser) {
				res.status(404).json({ message: 'Usuário logado não encontrado!' });
				return;
			}

			// Criando um Set para garantir que os IDs são únicos
			const allowedIdsToVisualize = new Set(
				loggedUser.companies.flatMap(company =>
					company.members.map((member: { id: number }) => member.id)
				)
			);

			// Adicionando o userId do usuário logado ao Set
			allowedIdsToVisualize.add(userId);

			// Verifica se o usuário logado pode visualizar o usuário solicitado
			if (!allowedIdsToVisualize.has(parseInt(id))) {
				res.status(403).json({ message: 'Você não possui permissão para visualizar esse usuário!' });
				return;
			}


			const user = await userService.getUserById(parseInt(id));

			if (user) {
				res.status(200).json(user);
			} else {
				res.status(404).json({ message: 'Usuário não encontrado' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar usuário', error });
		}
	}

	static async updateUser(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const { email, name, password, role } = req.body;

		try {
			const updatedUser = await UserService.updateUser(Number(id), { email, name, password, role });

			res.status(200).json(updatedUser);
		} catch (error) {
			console.error(error);
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro ao atualizar o usuário', error });
			}
		}
	}

	static async deleteUser(req: Request, res: Response): Promise<void> {
		const { id } = req.params;

		try {
			await UserService.deleteUser(Number(id));

			res.status(204).send();
		} catch (error) {
			console.error(error);
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro ao excluir usuário', error: error });
			}
		}
	}

	static async getUsersByCompany(req: Request, res: Response) {
		const { companyId } = req.query;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			if (!companyId) {
				res.status(400).json({ message: 'ID da empresa não fornecido!' });
				return;
			}

			const companyIdNumber = parseInt(companyId as string);

			// Check if user has access to this company
			const isUserInCompany = await userService.verifyIfUserBelongsToCompany(userId, companyIdNumber);
			if (!isUserInCompany) {
				res.status(403).json({ message: 'Você não possui permissão para acessar usuários desta empresa!' });
				return;
			}

			const users = await userService.getUsersByCompany(companyIdNumber);
			res.status(200).json(users);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar usuários da empresa', error });
		}
	}
}