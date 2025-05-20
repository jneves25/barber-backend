import { Request, Response } from 'express';
import { CompanyService } from './CompanyService';
import { CompanyMemberService } from '../company-member/CompanyMemberService';
import { UserService } from '../users/UserService';
import { RoleEnum } from '@prisma/client';

const companyService = new CompanyService();
const userService = new UserService();
const companyMemberService = new CompanyMemberService();

export class CompanyController {

	static async createCompany(req: Request, res: Response): Promise<void> {
		const { name, ownerId, address } = req.body;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const userData = await userService.getUserById(userId);

			if (!userData) {
				res.status(403).json({ message: "Usuário não encontrado" });
				return;
			}

			if (userData.role !== RoleEnum.ADMIN) {
				res.status(400).json({ message: "Apenas admininstradores podem criar uma empresa" });
				return;
			}

			if (!name) {
				throw new Error("É obrigatório enviar um nome para a empresa")
			}

			if (!ownerId) {
				throw new Error("É obrigatório enviar um usuário para ser administrador da empresa")
			}

			if (!address) {
				throw new Error("É obrigatório enviar um endereço para a empresa")
			}

			const company = await companyService.createCompany({ name, ownerId, address });
			res.status(201).json(company);
		} catch (error) {
			if (error instanceof Error) {
				res.status(422).json({ message: error.message });
			} else {
				res.status(400).json({ message: 'Erro inesperado ao criar time' });
			}
		}
	}

	static async getAllCompanys(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.userId;

			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const companies = await companyService.getCompanyByUserId(userId);
			res.status(200).json(companies);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao obter times', error });
		}
	}

	static async getCompanyById(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const userId = req.userId
		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const userData = await userService.getUserById(userId);

			if (!userData) {
				res.status(403).json({ message: "Usuário não encontrado" });
				return;
			}

			if (userData.companies.some(company => company.id !== parseInt(id))) {
				res.status(403).json({ message: "Você não possui permissão para visualizar esta empresa" });
				return;
			}

			const company = await companyService.getCompanyById(parseInt(id));

			if (company) {
				res.status(200).json(company);
			} else {
				res.status(404).json({ message: 'Time não encontrado' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Erro ao obter time', error });
		}
	}

	static async addMemberToCompany(req: Request, res: Response): Promise<void> {
		const { CompanyId, userId } = req.body;
		try {
			const CompanyMember = await companyMemberService.addMemberToCompany(CompanyId, userId);
			res.status(201).json(CompanyMember);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao adicionar membro ao time', error });
		}
	}

	static async getUserCompanys(req: Request, res: Response): Promise<void> {
		const userId = parseInt(req.params.userId);

		try {
			const companies = await companyService.getCompanyByUserId(userId);
			res.status(200).json(companies);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao obter times do usuário', error });
		}
	}

	static async updateCompany(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const userId = req.userId;
		const updateData = req.body;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const userData = await userService.getUserById(userId);

			if (!userData) {
				res.status(403).json({ message: "Usuário não encontrado" });
				return;
			}

			if (userData.companies.some(company => company.id !== parseInt(id))) {
				res.status(403).json({ message: "Você não possui permissão para atualizar esta empresa" });
				return;
			}

			const updatedCompany = await companyService.updateCompany(parseInt(id), updateData);
			res.status(200).json(updatedCompany);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao atualizar empresa', error });
		}
	}

	static async getCompanyBySlug(req: Request, res: Response): Promise<void> {
		const { slug } = req.params;

		try {
			if (!slug) {
				res.status(400).json({ message: 'Slug da empresa é obrigatório' });
				return;
			}

			const company = await companyService.getCompanyBySlug(slug);

			if (!company) {
				res.status(404).json({ message: 'Empresa não encontrada' });
				return;
			}

			res.status(200).json(company);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao obter empresa pelo slug', error });
		}
	}
}