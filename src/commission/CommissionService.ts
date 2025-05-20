import prisma from '../config/db/db';
import { CreateCommissionConfig, CreateCommissionRule } from './CommissionModel';

export class CommissionService {
	async createCommissionConfig(data: CreateCommissionConfig) {
		return await prisma.commissionConfig.create({
			data: {
				userId: data.userId,
				companyId: data.companyId,
				commissionType: data.commissionType,
				commissionMode: data.commissionMode,
				commissionValue: data.commissionValue,
			},
			include: {
				rules: true,
				user: true,
				company: true
			}
		});
	}

	async getCommissionConfigById(id: number) {
		return await prisma.commissionConfig.findUnique({
			where: {
				id,
				deletedAt: null
			},
			include: {
				rules: true,
				user: true,
				company: true
			}
		});
	}

	async getCommissionConfigsByCompany(companyId: number) {
		return await prisma.commissionConfig.findMany({
			where: {
				companyId,
				deletedAt: null
			},
			include: {
				rules: true,
				user: true,
				company: true
			}
		});
	}

	async updateCommissionConfig(id: number, data: Partial<CreateCommissionConfig>) {
		return await prisma.commissionConfig.update({
			where: {
				id,
				deletedAt: null
			},
			data,
			include: {
				rules: true,
				user: true,
				company: true
			}
		});
	}

	async deleteCommissionConfig(id: number) {
		return await prisma.commissionConfig.update({
			where: {
				id,
				deletedAt: null
			},
			data: {
				deletedAt: new Date()
			}
		});
	}

	async createCommissionRule(data: CreateCommissionRule) {
		return await prisma.commissionRule.create({
			data: {
				configId: data.configId,
				serviceId: data.serviceId,
				percentage: data.percentage
			}
		});
	}

	async getCommissionRulesByConfig(configId: number) {
		return await prisma.commissionRule.findMany({
			where: {
				configId,
				deletedAt: null
			}
		});
	}

	async updateCommissionRule(id: number, data: Partial<CreateCommissionRule>) {
		return await prisma.commissionRule.update({
			where: {
				id,
				deletedAt: null
			},
			data
		});
	}

	async deleteCommissionRule(id: number) {
		return await prisma.commissionRule.update({
			where: {
				id,
				deletedAt: null
			},
			data: {
				deletedAt: new Date()
			}
		});
	}

	async createDefaultCommissionConfig(userId: number, companyId: number) {
		return await prisma.commissionConfig.create({
			data: {
				userId,
				companyId,
				commissionType: 'GENERAL',
				commissionMode: 'FIXED',
				commissionValue: 100,
			}
		});
	}

	async getCommissionConfigByUserId(userId: number) {
		return await prisma.commissionConfig.findFirst({
			where: {
				userId: userId,
				deletedAt: null
			},
			include: {
				rules: true,
				user: true,
				company: true
			}
		});
	}
} 