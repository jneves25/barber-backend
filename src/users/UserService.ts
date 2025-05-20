import prisma from '../config/db/db'; // Importando Prisma Client
import bcrypt from 'bcryptjs';
import { RoleEnum } from '@prisma/client';

export class UserService {
	async createUserWithPermissions(
		data: { email: string; name: string; password: string, role: RoleEnum }
	): Promise<any> {
		const hashedPassword = await bcrypt.hash(data.password, 10);

		const existingUser = await prisma.user.findUnique({
			where: {
				email: data.email,
				deletedAt: null
			},
		});

		if (existingUser) {
			throw new Error('Email já está em uso');
		}

		// Verificação de campos obrigatórios
		if (!data.name) {
			throw new Error('É preciso enviar um nome do novo usuário');
		}
		if (!data.email) {
			throw new Error('É preciso enviar um e-mail para o novo usuário');
		}
		if (!data.role) {
			throw new Error('É preciso enviar um cargo para o novo usuário');
		} else {
			const validRoles = Object.values(RoleEnum);
			if (!validRoles.includes(data.role)) {
				throw new Error('Cargo enviado inválido');
			}
		}
		if (!data.password) {
			throw new Error('É preciso enviar uma senha para o novo usuário');
		}

		// Criação do usuário
		const newUser = await prisma.user.create({
			data: {
				email: data.email,
				name: data.name,
				role: data.role,
				password: hashedPassword,
			},
		});

		// Retornando o novo usuário, sem a senha
		const { password, ...newUserData } = newUser;
		return newUserData;
	}

	async getAllUsers() {
		return await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
			},
			where: {
				deletedAt: null
			}
		});
	}

	async getUserById(userId: number) {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
				deletedAt: null
			},
			include: {
				companies: {
					where: {
						ownerId: userId,
					},
					select: {
						id: true,
						name: true,
						members: {
							select: {
								user: {
									select: {
										id: true,
										name: true,
										email: true,
										role: true,
									},
								},
							},
						},
					},
				},
				commissionConfigs: true,
				permissions: true,
			},
		});

		if (!user) return null;

		const companyMembers = await prisma.companyMember.findMany({
			where: {
				userId: userId,
				deletedAt: null
			},
			select: {
				company: {
					select: {
						id: true,
						name: true,
						members: {
							select: {
								user: {
									select: {
										id: true,
										name: true,
										email: true,
										role: true,
									},
								},
							},
						},
					},
				},
			},
		});

		// Combina as empresas que o usuário é dono com as que ele é membro
		const companies = [
			...(Array.isArray(user.companies) ? user.companies : []), // Empresas onde o usuário é proprietário
			...companyMembers.map((companyMember) => companyMember.company), // Empresas onde o usuário é membro
		];

		return {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			companies: companies.map((company) => ({
				id: company.id,
				name: company.name,
				members: Array.isArray(company.members) ? company.members.map((member: any) => ({
					id: member.user.id,
					name: member.user.name,
					email: member.user.email,
					role: member.user.role,
				})) : [],
			})),
			permissions: user.permissions,
			commissionConfigs: user.commissionConfigs
		};
	}

	static async updateUser(userId: number, data: { email?: string; name?: string; password?: string; role?: RoleEnum }): Promise<any> {
		const userToUpdate = await prisma.user.findUnique({
			where: {
				id: userId,
				deletedAt: null
			},
		});

		if (!userToUpdate) {
			throw new Error('Usuário não encontrado');
		}

		if (data.role && data.role === RoleEnum.ADMIN) {
			throw new Error('Não é possível alterar o cargo para administrador');
		}

		const updatedUser = await prisma.user.update({
			where: {
				id: userId,
				deletedAt: null
			},
			data: {
				email: data.email || userToUpdate.email,
				name: data.name || userToUpdate.name,
				password: data.password ? await bcrypt.hash(data.password, 10) : userToUpdate.password,
				role: data.role || userToUpdate.role,
			},
		});

		const { password, ...newUserData } = updatedUser;
		return newUserData;
	}

	static async deleteUser(userId: number): Promise<void> {
		const userToDelete = await prisma.user.findUnique({
			where: {
				id: userId,
				deletedAt: null
			},
			select: { role: true },
		});

		if (!userToDelete) {
			throw new Error('Usuário não encontrado');
		}

		if (userToDelete.role === 'ADMIN') {
			throw new Error('Não é permitido excluir um usuário com cargo administrador');
		}

		await prisma.permission.update({
			where: { userId, deletedAt: null },
			data: {
				deletedAt: new Date()
			}
		});

		await prisma.companyMember.deleteMany({
			where: { userId },
		});

		await prisma.user.update({
			where: { id: userId, deletedAt: null },
			data: {
				deletedAt: new Date()
			}
		});
	}

	async verifyIfCompanyIsValidOnUserRegistration(userId: number): Promise<boolean> {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
				deletedAt: null
			},
			select: { id: true }
		});

		if (!user) {
			throw new Error('Usuário não encontrado');
		}

		// Get companies where user is owner
		const ownedCompanies = await prisma.company.findMany({
			where: { ownerId: userId }
		});

		// Get companies where user is member
		const memberCompanies = await prisma.companyMember.findMany({
			where: { userId }
		});

		return ownedCompanies.length > 0 || memberCompanies.length > 0;
	}

	async verifyIfUserBelongsToCompany(userId: number, companyId: number): Promise<boolean> {
		// Verifica se o usuário existe
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
				deletedAt: null
			},
			select: { id: true }
		});

		if (!user) {
			throw new Error('Usuário não encontrado');
		}

		// Verifica se a empresa existe
		const company = await prisma.company.findUnique({
			where: {
				id: companyId,
				deletedAt: null
			},
			select: { id: true }
		});

		if (!company) {
			throw new Error('Empresa não encontrada');
		}

		// Verifica se o usuário é o proprietário da empresa
		const isOwner = await prisma.company.findFirst({
			where: {
				id: companyId,
				ownerId: userId,
				deletedAt: null
			}
		});

		// Verifica se o usuário é membro da empresa
		const isMember = await prisma.companyMember.findFirst({
			where: {
				companyId: companyId,
				userId: userId,
				deletedAt: null
			}
		});

		return !!isOwner || !!isMember;
	}

	async getUsersByCompany(companyId: number) {
		// First, find all company members
		const companyMembers = await prisma.companyMember.findMany({
			where: {
				companyId,
				deletedAt: null
			},
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
						role: true
					}
				}
			}
		});

		// Find the company owner
		const company = await prisma.company.findUnique({
			where: {
				id: companyId,
				deletedAt: null
			},
			include: {
				owner: {
					select: {
						id: true,
						email: true,
						name: true,
						role: true
					}
				}
			}
		});

		// If company does not exist, return empty array
		if (!company) return [];

		// Transform to user objects
		const memberUsers = companyMembers.map(member => member.user);

		// Make sure we don't add the owner twice if they are also a member
		const ownerAlreadyInMembers = memberUsers.some(user => user.id === company.owner.id);

		// Return all users including owner (unless owner is already in members list)
		return ownerAlreadyInMembers
			? memberUsers
			: [company.owner, ...memberUsers];
	}
}
