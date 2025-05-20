import { CommissionTypeEnum, CommissionModeEnum, CommissionRuleTypeEnum } from '@prisma/client';

export interface CreateCommissionConfig {
	userId: number;
	companyId: number;
	commissionType: CommissionTypeEnum;
	commissionMode: CommissionModeEnum;
	commissionValue?: number; // Float in the database
}

export interface CreateCommissionRule {
	configId: number;
	serviceId: number;
	serviceType: CommissionRuleTypeEnum;
	percentage: number; // Float in the database
} 