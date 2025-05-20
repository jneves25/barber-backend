import { Permission, RoleEnum } from '@prisma/client';
import prisma from '../config/db/db';

export class PermissionService {

	async assignPermissionsToUser(userId: number, role?: RoleEnum, permissions?: string[]) {
		// Dados padrão de permissão, tudo negado - exatamente conforme o schema
		const permissionData: any = {
			manageCompany: false,
			viewCompanys: false,
			addMember: false,
			managePermissions: false,
			viewPermissions: false,
			viewAllAppointments: false,
			manageAppointments: false,
			viewOwnAppointments: false,
			viewAllClients: false,
			manageClients: false,
			viewOwnClients: false,
			viewAllServices: false,
			manageServices: false,
			viewServices: false,
			viewAllProducts: false,
			manageProducts: false,
			viewProducts: false,
			viewAllBarbers: false,
			manageBarbers: false,
			viewAllCommissions: false,
			manageCommissions: false,
			viewOwnCommissions: false,
			viewAllGoals: false,
			manageGoals: false,
			viewOwnGoals: false,
			viewFullRevenue: false,
			viewOwnRevenue: false,
			viewFullStatistics: true, // default true no schema
			viewOwnStatistics: true,  // default true no schema
			manageSettings: false,
			viewUsers: false,
			manageUsers: false
		};

		// Permissões baseadas no papel (role)
		if (role === RoleEnum.ADMIN) {
			// Admin tem todas as permissões
			Object.keys(permissionData).forEach(key => {
				permissionData[key] = true;
			});
		} else if (role === RoleEnum.MANAGER) {
			// Permissões de gerente
			permissionData.viewCompanys = true;
			permissionData.viewAllAppointments = true;
			permissionData.manageAppointments = true;
			permissionData.viewAllClients = true;
			permissionData.manageClients = true;
			permissionData.viewAllServices = true;
			permissionData.viewServices = true;
			permissionData.viewAllProducts = true;
			permissionData.viewProducts = true;
			permissionData.viewFullStatistics = true;
		} else if (role === RoleEnum.USER) {
			// Permissões de usuário comum (barbeiro)
			permissionData.viewOwnAppointments = true;
			permissionData.viewOwnClients = true;
			permissionData.viewServices = true;
			permissionData.viewProducts = true;
			permissionData.viewOwnCommissions = true;
			permissionData.viewOwnGoals = true;
			permissionData.viewOwnRevenue = true;
			permissionData.viewOwnStatistics = true;
		}

		// Permissões adicionais especificadas
		if (permissions && permissions.length > 0) {
			permissions.forEach(permission => {
				if (permission in permissionData) {
					permissionData[permission] = true;
				}
			});
		}

		try {
			// Verificar se o usuário já tem permissões
			const existingPermission = await prisma.permission.findFirst({
				where: {
					userId,
					deletedAt: null
				}
			});

			let userPermissions;

			if (existingPermission) {
				// Atualizar permissões existentes
				userPermissions = await prisma.permission.update({
					where: {
						id: existingPermission.id
					},
					data: permissionData
				});
			} else {
				// Criar novas permissões
				userPermissions = await prisma.permission.create({
					data: {
						userId,
						...permissionData
					}
				});
			}

			console.log('Permissões atribuídas com sucesso ao usuário!');
			return userPermissions;
		} catch (error) {
			console.error('Erro ao atribuir permissões ao usuário:', error);
			throw new Error('Erro ao atribuir permissões ao usuário');
		}
	}

	async createPermission(data: Permission): Promise<any> {
		return await prisma.permission.create({
			data,
		});
	}

	async getAllPermissions(): Promise<any> {
		return await prisma.permission.findMany();
	}

	async getPermissionById(permissionId: number): Promise<any> {
		return await prisma.permission.findUnique({
			where: {
				id: permissionId,
				deletedAt: null
			},
		});
	}

	async updatePermission(permissionId: number, data: Permission): Promise<any> {
		return await prisma.permission.update({
			where: {
				id: permissionId,
				deletedAt: null
			},
			data,
		});
	}

	async deletePermission(permissionId: number): Promise<any> {
		return await prisma.permission.update({
			where: {
				id: permissionId,
				deletedAt: null
			},
			data: {
				deletedAt: new Date()
			}
		});
	}

	async getUserPermissions(userId: number): Promise<Permission | null> {
		return await prisma.permission.findUnique({
			where: {
				userId,
				deletedAt: null
			}
		});
	}

}
