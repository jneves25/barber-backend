import prisma from '../config/db/db';

export class ProductService {
	async createProduct(data: {
		name: string;
		description: string;
		price: number;
		stock: number;
		imageUrl: string;
		companyId: number;
	}) {
		// Validate required fields
		if (!data.name) {
			throw new Error('Nome do produto é obrigatório');
		}

		if (!data.price || data.price <= 0) {
			throw new Error('Preço deve ser maior que zero');
		}

		if (data.stock < 0) {
			throw new Error('Estoque não pode ser negativo');
		}

		if (!data.companyId) {
			throw new Error('ID da empresa é obrigatório');
		}

		// Check if company exists
		const company = await prisma.company.findUnique({
			where: {
				id: data.companyId,
				deletedAt: null
			}
		});

		if (!company) {
			throw new Error('Empresa não encontrada');
		}

		return await prisma.product.create({
			data: {
				name: data.name,
				description: data.description || '',
				price: data.price,
				stock: data.stock,
				imageUrl: data.imageUrl || '',
				companyId: data.companyId
			}
		});
	}

	async getAllProducts(companyId: number) {
		return await prisma.product.findMany({
			where: {
				companyId,
				deletedAt: null
			},
			orderBy: {
				name: 'asc'
			}
		});
	}

	async getProductById(productId: number) {
		return await prisma.product.findUnique({
			where: {
				id: productId,
				deletedAt: null
			}
		});
	}

	async getProductsByCompanySlug(slug: string) {
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

		// Busca os produtos dessa empresa
		return await prisma.product.findMany({
			where: {
				companyId: company.id,
				deletedAt: null
			},
			select: {
				id: true,
				name: true,
				description: true,
				price: true,
				stock: true,
				imageUrl: true,
				// Não inclua dados sensíveis como companyId
			},
			orderBy: {
				name: 'asc'
			}
		});
	}

	async updateProduct(productId: number, data: {
		name?: string;
		description?: string;
		price?: number;
		stock?: number;
		imageUrl?: string;
	}) {
		const productToUpdate = await prisma.product.findUnique({
			where: {
				id: productId,
				deletedAt: null
			}
		});

		if (!productToUpdate) {
			throw new Error('Produto não encontrado');
		}

		// Validate price if provided
		if (data.price !== undefined && data.price <= 0) {
			throw new Error('Preço deve ser maior que zero');
		}

		// Validate stock if provided
		if (data.stock !== undefined && data.stock < 0) {
			throw new Error('Estoque não pode ser negativo');
		}

		return await prisma.product.update({
			where: {
				id: productId,
				deletedAt: null
			},
			data: {
				name: data.name || productToUpdate.name,
				description: data.description !== undefined ? data.description : productToUpdate.description,
				price: data.price !== undefined ? data.price : productToUpdate.price,
				stock: data.stock !== undefined ? data.stock : productToUpdate.stock,
				imageUrl: data.imageUrl || productToUpdate.imageUrl
			}
		});
	}

	async updateProductStock(productId: number, quantity: number) {
		const product = await prisma.product.findUnique({
			where: {
				id: productId,
				deletedAt: null
			}
		});

		if (!product) {
			throw new Error('Produto não encontrado');
		}

		const newStock = product.stock - quantity;

		if (newStock < 0) {
			throw new Error('Estoque insuficiente');
		}

		return await prisma.product.update({
			where: {
				id: productId,
				deletedAt: null
			},
			data: {
				stock: newStock
			}
		});
	}

	async deleteProduct(productId: number) {
		// Check if product exists
		const product = await prisma.product.findUnique({
			where: {
				id: productId,
				deletedAt: null
			}
		});

		if (!product) {
			throw new Error('Produto não encontrado');
		}

		// Check if product is used in any appointment
		const productAppointments = await prisma.productAppointment.findFirst({
			where: {
				productId,
				deletedAt: null
			}
		});

		if (productAppointments) {
			throw new Error('Não é possível excluir um produto que está sendo usado em agendamentos');
		}

		return await prisma.product.update({
			where: {
				id: productId,
				deletedAt: null
			},
			data: {
				deletedAt: new Date()
			}
		});
	}
} 