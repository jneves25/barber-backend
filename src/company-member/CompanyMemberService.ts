// src/services/CompanyMemberService.ts
import prisma from '../config/db/db';

export class CompanyMemberService {
	// Adicionar um membro ao time
	async addMemberToCompany(companyId: number, userId: number): Promise<any> {
		const CompanyMember = await prisma.companyMember.create({
			data: {
				companyId,
				userId,
			},
		});
		return CompanyMember;
	}

	// Obter todos os membros de um time
	async getMembersByCompanyId(companyId: number): Promise<any> {
		const members = await prisma.companyMember.findMany({
			where: {
				companyId,
				deletedAt: null
			},
			include: {
				user: true, // Para incluir as informações do usuário
			},
		});
		return members;
	}

	// Remover um membro do time
	async removeMemberFromCompany(companyId: number, userId: number): Promise<any> {
		const removedMember = await prisma.companyMember.update({
			where: {
				companyId_userId: { companyId, userId },
				deletedAt: null
			},
			data: {
				deletedAt: new Date()
			}
		});
		return removedMember;
	}
}
