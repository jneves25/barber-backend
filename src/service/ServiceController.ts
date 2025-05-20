import { Request, Response } from 'express';
import { Service } from '@prisma/client';
import { ServiceService } from './ServiceService';
import { UserService } from '../users/UserService';
import { CompanyMemberService } from '../company-member/CompanyMemberService';
import { CommissionService } from '../commission/CommissionService';

const serviceService = new ServiceService();
const userService = new UserService();
const companyMemberService = new CompanyMemberService();
const commissionService = new CommissionService();

export class ServiceController {
	static async createService(req: Request, res: Response): Promise<void> {
		const { name, price, duration, description, companyId } = req.body;
		const userId = req.userId as number;
		const parsedCompanyId = parseInt(companyId);

		try {
			const isCompanyValid = await userService.verifyIfUserBelongsToCompany(userId, parsedCompanyId);

			if (!isCompanyValid) {
				res.status(403).json({ message: 'Sem permissão para alterar dados dessa empresa' });
				return;
			}

			const newService = await serviceService.createService({
				name,
				price: parseFloat(price),
				duration: parseInt(duration),
				description,
				companyId: parsedCompanyId
			});

			// Get all users from the company
			const companyUsers = await companyMemberService.getMembersByCompanyId(parsedCompanyId);

			// For each user, get their commission config and create a rule
			for (const member of companyUsers) {
				const userConfig = await commissionService.getCommissionConfigByUserId(member.userId);
				if (userConfig) {
					await commissionService.createCommissionRule({
						configId: userConfig.id,
						serviceId: newService.id,
						serviceType: 'PERCENTAGE',
						percentage: 40 // Default percentage
					});
				}
			}

			res.status(201).json(newService);
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro inesperado ao criar serviço', error });
			}
		}
	}

	static async getAllServices(req: Request, res: Response): Promise<void> {
		const { companyId } = req.query;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			if (!companyId) {
				res.status(422).json({ message: 'ID da empresa é obrigatório' });
				return;
			}

			const isCompanyValid = await userService.verifyIfUserBelongsToCompany(userId, Number(companyId));

			if (!isCompanyValid) {
				res.status(403).json({ message: 'Sem permissão para acessar serviços desta empresa' });
				return;
			}

			const services = await serviceService.getAllServices(Number(companyId));
			res.status(200).json(services);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar serviços', error });
		}
	}

	static async getServiceById(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const service = await serviceService.getServiceById(Number(id));

			if (!service) {
				res.status(404).json({ message: 'Serviço não encontrado' });
				return;
			}

			const isCompanyValid = await userService.verifyIfUserBelongsToCompany(userId, service.companyId);

			if (!isCompanyValid) {
				res.status(403).json({ message: 'Sem permissão para acessar esse serviço' });
				return;
			}

			res.status(200).json(service);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar serviço', error });
		}
	}

	static async updateService(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const { name, price, duration, description } = req.body;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const service = await serviceService.getServiceById(Number(id));

			if (!service) {
				res.status(404).json({ message: 'Serviço não encontrado' });
				return;
			}

			const isCompanyValid = await userService.verifyIfUserBelongsToCompany(userId, service.companyId);

			if (!isCompanyValid) {
				res.status(403).json({ message: 'Sem permissão para acessar esse serviço' });
				return;
			}

			const updatedService = await serviceService.updateService(
				Number(id),
				{
					name,
					price: price ? parseFloat(price) : undefined,
					duration: duration ? parseInt(duration) : undefined,
					description
				}
			);

			res.status(200).json(updatedService);
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro ao atualizar serviço', error });
			}
		}
	}

	static async deleteService(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const service = await serviceService.getServiceById(Number(id));

			if (!service) {
				res.status(404).json({ message: 'Serviço não encontrado' });
				return;
			}

			const isCompanyValid = await userService.verifyIfUserBelongsToCompany(userId, service.companyId);

			if (!isCompanyValid) {
				res.status(403).json({ message: 'Sem permissão para acessar esse serviço' });
				return;
			}

			await serviceService.deleteService(Number(id));
			res.status(204).send();
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro ao excluir serviço', error });
			}
		}
	}

	static async getServicesByCompanySlug(req: Request, res: Response): Promise<void> {
		try {
			const { slug } = req.params;
			if (!slug) {
				res.status(400).json({ message: 'Slug da empresa é obrigatório' });
				return;
			}

			const services = await serviceService.getServicesByCompanySlug(slug);
			res.status(200).json(services);
		} catch (error) {
			console.error('Erro ao buscar serviços:', error);
			res.status(500).json({ message: 'Erro ao buscar serviços' });
		}
	}
} 