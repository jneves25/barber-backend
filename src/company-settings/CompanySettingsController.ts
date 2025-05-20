import { Request, Response } from 'express';
import { CompanySettingsService } from './CompanySettingsService';
import { UserService } from '../users/UserService';
import { RoleEnum } from '@prisma/client';

const companySettingsService = new CompanySettingsService();
const userService = new UserService();

export class CompanySettingsController {
	static async createSettings(req: Request, res: Response): Promise<void> {
		const {
			companyId,
			appointmentIntervalMinutes,
			advanceNoticeDays,
			preparationTimeMinutes,
			sendReminderWhatsApp,
			confirmAppointmentWhatsApp,
			notifyBarberNewAppointments,
			acceptedPaymentMethods,
			commissionPercentage,
			commissionPaymentFrequency,
			allowEarlyPaymentOnline,
			requireDepositConfirmation,
			applyDiscountForCashPayment,
			workingHoursId
		} = req.body;
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
				res.status(400).json({ message: "Apenas administradores podem criar configurações" });
				return;
			}

			if (!companyId) {
				throw new Error("É obrigatório enviar o ID da empresa");
			}

			const settings = await companySettingsService.createSettings({
				companyId,
				appointmentIntervalMinutes,
				advanceNoticeDays,
				preparationTimeMinutes,
				sendReminderWhatsApp,
				confirmAppointmentWhatsApp,
				notifyBarberNewAppointments,
				acceptedPaymentMethods,
				commissionPercentage,
				commissionPaymentFrequency,
				allowEarlyPaymentOnline,
				requireDepositConfirmation,
				applyDiscountForCashPayment,
				workingHoursId
			});

			res.status(201).json(settings);
		} catch (error) {
			if (error instanceof Error) {
				res.status(422).json({ message: error.message });
			} else {
				res.status(400).json({ message: 'Erro inesperado ao criar configurações' });
			}
		}
	}

	static async getSettingsByCompanyId(req: Request, res: Response): Promise<void> {
		const { companyId } = req.params;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const settings = await companySettingsService.getSettingsByCompanyId(parseInt(companyId));

			if (settings) {
				res.status(200).json(settings);
			} else {
				res.status(404).json({ message: 'Configurações não encontradas' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Erro ao obter configurações', error });
		}
	}

	static async updateSettings(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const updateData = req.body;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const settings = await companySettingsService.updateSettings(parseInt(id), updateData);

			if (settings) {
				res.status(200).json(settings);
			} else {
				res.status(404).json({ message: 'Configurações não encontradas' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Erro ao atualizar configurações', error });
		}
	}

	static async deleteSettings(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			await companySettingsService.deleteSettings(parseInt(id));
			res.status(204).send();
		} catch (error) {
			res.status(500).json({ message: 'Erro ao deletar configurações', error });
		}
	}
} 