import { Request, Response } from 'express';
import { AuthService } from './AuthService';
import { PermissionService } from '../permission/PermissionService';
import { CompanyService } from '../company/CompanyService';
import { CommissionService } from '../commission/CommissionService';
import { GoalService } from '../goal/GoalService';
import { ServiceService } from '../service/ServiceService';

const permissionService = new PermissionService()
const companyService = new CompanyService()
const commissionService = new CommissionService();
const goalService = new GoalService();
const serviceService = new ServiceService();

export class AuthController {
	static async login(req: Request, res: Response) {
		const { email, password } = req.body;
		try {
			const { token, user } = await AuthService.login(email, password);
			res.status(200).json({ token, user });
		} catch (error: unknown) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(400).json({ message: 'An unknown error occurred' });
			}
		}
	}

	static async register(req: Request, res: Response) {
		const { email, name, password, businessName, businessAddress } = req.body;

		try {
			if (!businessName) {
				throw new Error("Nome da empresa é obrigatório")
			}

			if (!businessAddress) {
				throw new Error("O endereço da empresa é obrigatório")
			}

			const { token, user } = await AuthService.register(email, name, password);

			if (!user.id) {
				res.status(422).json({ message: "Ocorreu um erro ao cadastrar o usuário" });
			}

			await permissionService.assignPermissionsToUser(user.id, user.role);

			const company = await companyService.createCompany({
				ownerId: user.id,
				name: businessName,
				address: businessAddress
			});

			const commissionConfig = await commissionService.createDefaultCommissionConfig(user.id, company.id);

			const services = await serviceService.getAllServices(company.id);

			for (const service of services) {
				await commissionService.createCommissionRule({
					configId: commissionConfig.id,
					serviceId: service.id,
					serviceType: 'PERCENTAGE',
					percentage: 40,
				});
			}

			// Add goals from current month until end of year
			const currentDate = new Date();
			const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
			const currentYear = currentDate.getFullYear();

			// Create goals from current month to December
			for (let month = currentMonth; month <= 12; month++) {
				await goalService.createGoal({
					userId: user.id,
					companyId: company.id,
					month: month,
					year: currentYear,
					target: 0 // Default target value
				});
			}

			res.status(201).json({ token, user });
		} catch (error: unknown) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(400).json({ message: 'An unknown error occurred' });
			}
		}
	}
}
