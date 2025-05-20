import prisma from '../config/db/db';

export interface CreateCompanySettings {
	companyId: number;
	appointmentIntervalMinutes?: number;
	advanceNoticeDays?: number;
	preparationTimeMinutes?: number;
	sendReminderWhatsApp?: boolean;
	confirmAppointmentWhatsApp?: boolean;
	notifyBarberNewAppointments?: boolean;
	acceptedPaymentMethods?: string;
	commissionPercentage?: number;
	commissionPaymentFrequency?: string;
	allowEarlyPaymentOnline?: boolean;
	requireDepositConfirmation?: boolean;
	applyDiscountForCashPayment?: boolean;
	workingHoursId: number;
}

export class CompanySettingsService {
	async createSettings(data: CreateCompanySettings): Promise<any> {
		const workingHours = await prisma.workingHours.findUnique({
			where: {
				id: data.workingHoursId,
				deletedAt: null
			}
		});

		if (!workingHours) {
			throw new Error('Working hours not found');
		}

		return await prisma.companySettings.create({
			data: {
				companyId: data.companyId,
				appointmentIntervalMinutes: data.appointmentIntervalMinutes || 30,
				advanceNoticeDays: data.advanceNoticeDays || 1,
				preparationTimeMinutes: data.preparationTimeMinutes || 15,
				sendReminderWhatsApp: data.sendReminderWhatsApp || true,
				confirmAppointmentWhatsApp: data.confirmAppointmentWhatsApp || true,
				notifyBarberNewAppointments: data.notifyBarberNewAppointments || true,
				acceptedPaymentMethods: data.acceptedPaymentMethods || '[]',
				commissionPercentage: data.commissionPercentage || 10.0,
				commissionPaymentFrequency: data.commissionPaymentFrequency || 'quinzenal',
				allowEarlyPaymentOnline: data.allowEarlyPaymentOnline || false,
				requireDepositConfirmation: data.requireDepositConfirmation || true,
				applyDiscountForCashPayment: data.applyDiscountForCashPayment || true,
				workingHoursId: data.workingHoursId
			},
			include: {
				workingHours: true
			}
		});
	}

	async getSettingsByCompanyId(companyId: number): Promise<any> {
		return await prisma.companySettings.findFirst({
			where: {
				companyId,
				deletedAt: null
			},
			include: {
				workingHours: true
			}
		});
	}

	async updateSettings(id: number, data: Partial<CreateCompanySettings>): Promise<any> {
		return await prisma.companySettings.update({
			where: {
				id,
				deletedAt: null
			},
			data,
			include: {
				workingHours: true
			}
		});
	}

	async deleteSettings(id: number): Promise<void> {
		await prisma.companySettings.update({
			where: {
				id,
				deletedAt: null
			},
			data: {
				deletedAt: new Date()
			}
		});
	}
} 