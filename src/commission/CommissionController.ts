import { Request, Response } from 'express';
import { CommissionService } from './CommissionService';
import { CreateCommissionConfig, CreateCommissionRule } from './CommissionModel';

const commissionService = new CommissionService();

export class CommissionController {
	static async createCommissionConfig(req: Request, res: Response): Promise<void> {
		try {
			const data: CreateCommissionConfig = req.body;
			const commissionConfig = await commissionService.createCommissionConfig(data);
			res.status(201).json(commissionConfig);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao criar configuração de comissão', error });
		}
	}

	static async getCommissionConfigById(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const commissionConfig = await commissionService.getCommissionConfigById(parseInt(id));
			if (commissionConfig) {
				res.status(200).json(commissionConfig);
			} else {
				res.status(404).json({ message: 'Configuração de comissão não encontrada' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Erro ao obter configuração de comissão', error });
		}
	}

	static async getCommissionConfigsByCompany(req: Request, res: Response): Promise<void> {
		const { companyId } = req.query;
		const userId = req.userId;

		try {
			if (!userId || !companyId) {
				res.status(400).json({ message: 'Parâmetros inválidos' });
				return;
			}

			const commissionConfigs = await commissionService.getCommissionConfigsByCompany(Number(companyId));
			res.status(200).json(commissionConfigs);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao obter configurações de comissão', error });
		}
	}

	static async updateCommissionConfig(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const data = req.body;
			console.log(data);
			const updatedConfig = await commissionService.updateCommissionConfig(parseInt(id), data);
			console.log(updatedConfig);
			res.status(200).json(updatedConfig);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao atualizar configuração de comissão', error });
		}
	}

	static async deleteCommissionConfig(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			await commissionService.deleteCommissionConfig(parseInt(id));
			res.status(204).send();
		} catch (error) {
			res.status(500).json({ message: 'Erro ao deletar configuração de comissão', error });
		}
	}

	static async createCommissionRule(req: Request, res: Response): Promise<void> {
		try {
			const data: CreateCommissionRule = req.body;
			const commissionRule = await commissionService.createCommissionRule(data);
			res.status(201).json(commissionRule);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao criar regra de comissão', error });
		}
	}

	static async getCommissionRulesByConfig(req: Request, res: Response): Promise<void> {
		try {
			const { commissionId } = req.params;
			const commissionRules = await commissionService.getCommissionRulesByConfig(parseInt(commissionId));
			res.status(200).json(commissionRules);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao obter regras de comissão', error });
		}
	}

	static async updateCommissionRule(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const data = req.body;
			const updatedRule = await commissionService.updateCommissionRule(parseInt(id), data);
			res.status(200).json(updatedRule);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao atualizar regra de comissão', error });
		}
	}

	static async deleteCommissionRule(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			await commissionService.deleteCommissionRule(parseInt(id));
			res.status(204).send();
		} catch (error) {
			res.status(500).json({ message: 'Erro ao deletar regra de comissão', error });
		}
	}

	static async getCommissionConfigByUserId(req: Request, res: Response): Promise<void> {
		try {
			const { userId } = req.params;
			const commissionConfig = await commissionService.getCommissionConfigByUserId(parseInt(userId));

			if (commissionConfig) {
				res.status(200).json(commissionConfig);
			} else {
				res.status(404).json({ message: 'Configuração de comissão não encontrada para este usuário' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Erro ao obter configuração de comissão do usuário', error });
		}
	}
} 