// src/controllers/CompanyMemberController.ts
import { Request, Response } from 'express';
import { CompanyMemberService } from './CompanyMemberService';

const companyMemberService = new CompanyMemberService();

export class CompanyMemberController {
	static async addMember(req: Request, res: Response) {
		const { CompanyId, userId } = req.body;
		try {
			const member = await companyMemberService.addMemberToCompany(CompanyId, userId);
			res.status(201).json(member);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao adicionar membro ao time', error });
		}
	}

	static async getMembers(req: Request, res: Response) {
		const { CompanyId } = req.params;
		try {
			const members = await companyMemberService.getMembersByCompanyId(parseInt(CompanyId));
			res.status(200).json(members);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao obter membros do time', error });
		}
	}

	static async removeMember(req: Request, res: Response) {
		const { CompanyId, userId } = req.body;
		try {
			const removedMember = await companyMemberService.removeMemberFromCompany(CompanyId, userId);
			res.status(200).json(removedMember);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao remover membro do time', error });
		}
	}
}
