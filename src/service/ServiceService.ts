import prisma from '../config/db/db';

export class ServiceService {
	async createService(data: {
		name: string;
		price: number;
		duration: number;
		description: string;
		companyId: number;
	}) {
		// Validate required fields
		if (!data.name) {
			throw new Error('Nome do serviço é obrigatório');
		}

		if (!data.price || data.price <= 0) {
			throw new Error('Preço deve ser maior que zero');
		}

		if (!data.duration || data.duration <= 0) {
			throw new Error('Duração deve ser maior que zero');
		}

		if (!data.companyId) {
			throw new Error('ID da empresa é obrigatório');
		}

		return await prisma.service.create({
			data: {
				name: data.name,
				price: data.price,
				duration: data.duration,
				description: data.description || '',
				companyId: data.companyId
			}
		});
	}

	async getAllServices(companyId: number) {
		return await prisma.service.findMany({
			where: {
				companyId,
				deletedAt: null
			},
			orderBy: {
				name: 'asc'
			}
		});
	}

	async getServiceById(serviceId: number) {
		return await prisma.service.findUnique({
			where: {
				id: serviceId,
				deletedAt: null
			}
		});
	}

	async getServicesByCompanySlug(slug: string) {
		// Primeiro encontra a empresa pelo slug
		const company = await prisma.company.findUnique({
			where: {
				slug,
				deletedAt: null
			},
			select: {
				id: true
			}
		});

		if (!company) {
			throw new Error('Empresa não encontrada');
		}

		// Busca os serviços ativos dessa empresa
		return await prisma.service.findMany({
			where: {
				companyId: company.id,
				deletedAt: null
			},
			select: {
				id: true,
				name: true,
				description: true,
				price: true,
				duration: true,
				// Não inclua dados sensíveis como companyId
			},
			orderBy: {
				name: 'asc'
			}
		});
	}

	async updateService(serviceId: number, data: {
		name?: string;
		price?: number;
		duration?: number;
		description?: string;
	}) {
		const serviceToUpdate = await prisma.service.findUnique({
			where: {
				id: serviceId,
				deletedAt: null
			}
		});

		if (!serviceToUpdate) {
			throw new Error('Serviço não encontrado');
		}

		// Validate price if provided
		if (data.price !== undefined && data.price <= 0) {
			throw new Error('Preço deve ser maior que zero');
		}

		// Validate duration if provided
		if (data.duration !== undefined && data.duration <= 0) {
			throw new Error('Duração deve ser maior que zero');
		}

		return await prisma.service.update({
			where: {
				id: serviceId,
				deletedAt: null
			},
			data: {
				name: data.name || serviceToUpdate.name,
				price: data.price !== undefined ? data.price : serviceToUpdate.price,
				duration: data.duration !== undefined ? data.duration : serviceToUpdate.duration,
				description: data.description !== undefined ? data.description : serviceToUpdate.description
			}
		});
	}

	async deleteService(serviceId: number) {
		// Check if service exists
		const service = await prisma.service.findUnique({
			where: {
				id: serviceId,
				deletedAt: null
			}
		});

		if (!service) {
			throw new Error('Serviço não encontrado');
		}

		// Check if service is used in any appointment
		// const serviceAppointments = await prisma.serviceAppointment.findFirst({
		// 	where: {
		// 		serviceId,
		// 		deletedAt: null
		// 	}
		// });

		// if (serviceAppointments) {
		// 	throw new Error('Não é possível excluir um serviço que está sendo usado em agendamentos');
		// }

		await prisma.commissionRule.deleteMany({
			where: {
				serviceId,
				deletedAt: null
			}
		});

		return await prisma.service.update({
			where: {
				id: serviceId,
				deletedAt: null
			},
			data: {
				deletedAt: new Date()
			}
		});
	}
} 