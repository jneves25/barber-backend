import prisma from '../config/db/db';

export interface CreateCompany {
	name: string;
	id?: number;
	ownerId: number;
	settingsId?: number;
	address: string;
	logo?: string;
	backgroundImage?: string;
	phone?: string;
	whatsapp?: string;
	email?: string;
	slug?: string;
}

export class CompanyService {
	slugify = (name: string): string => {
		// Converter nome para minúsculas e substituir espaços por hífens
		const baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
		// Adicionar 6 caracteres aleatórios ao final para garantir unicidade
		const randomChars = Math.random().toString(36).substring(2, 8);
		return `${baseSlug}-${randomChars}`;
	};

	async createCompany(data: CreateCompany): Promise<any> {
		// Gerar uma slug baseada no nome se não for fornecida
		const slug = data.slug || this.slugify(data.name);

		const company = await prisma.company.create({
			data: {
				ownerId: data.ownerId,
				name: data.name,
				address: data.address,
				slug: slug
			},
		});

		const workHoursSettings = await prisma.workingHours.create({})

		const companySettings = await prisma.companySettings.create({
			data: {
				companyId: company.id,
				workingHoursId: workHoursSettings.id
			},
		});

		// Add owner as a company member
		await prisma.companyMember.create({
			data: {
				companyId: company.id,
				userId: data.ownerId
			}
		});

		const updatedCompany = await prisma.company.update({
			where: { id: company.id },
			data: {
				settingsId: companySettings.id,
			},
		});

		return updatedCompany;
	}


	async getAllCompanys(id: number): Promise<any> {
		return await prisma.company.findMany({
			where: {
				ownerId: id,
				deletedAt: null
			}
		});
	}

	async getCompanyById(CompanyId: number): Promise<any> {
		return await prisma.company.findUnique({
			where: {
				id: CompanyId,
				deletedAt: null
			},
			include: {
				owner: true,
				members: {
					include: {
						user: true,
					},
				},
			},
		});
	}

	async getCompanyByUserId(userId: number): Promise<any> {
		return await prisma.company.findMany({
			where: {
				OR: [
					{
						ownerId: userId,
						deletedAt: null
					}, // Empresas onde o usuário é proprietário
					{
						members: {
							some: {
								userId: userId,
								deletedAt: null
							}
						}
					}, // Empresas onde o usuário é membro
				],
			},
			include: {
				owner: true,
				members: {
					include: {
						user: true,
					},
				},
			},
		});
	}

	async getCompanyWithMembers(CompanyId: number) {
		return await prisma.company.findUnique({
			where: {
				id: CompanyId,
				deletedAt: null
			},
			include: {
				owner: true,
				members: {
					include: {
						user: true,
					},
				},
			},
		});
	}

	async getCompanyBySlug(slug: string) {
		return await prisma.company.findUnique({
			where: {
				slug,
				deletedAt: null
			},
			include: {
				owner: true,
				settings: {
					include: {
						workingHours: true
					}
				},
				members: {
					include: {
						user: true,
					},
				},
			},
		});
	}

	async updateCompany(id: number, data: Partial<CreateCompany>): Promise<any> {
		return await prisma.company.update({
			where: {
				id,
				deletedAt: null
			},
			data: {
				name: data.name,
				address: data.address,
				logo: data.logo,
				backgroundImage: data.backgroundImage,
				phone: data.phone,
				whatsapp: data.whatsapp,
				email: data.email
			},
			include: {
				owner: true,
				members: {
					include: {
						user: true,
					},
				},
			},
		});
	}
}
