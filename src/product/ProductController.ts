import { Request, Response } from 'express';
import { ProductService } from './ProductService';
import { UserService } from '../users/UserService';

const productService = new ProductService();
const userService = new UserService();

export class ProductController {
	static async createProduct(req: Request, res: Response): Promise<void> {
		const { name, description, price, stock, imageUrl, companyId } = req.body;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const isCompanyValid = await userService.verifyIfUserBelongsToCompany(userId, Number(companyId));

			if (!isCompanyValid) {
				res.status(403).json({ message: 'Sem permissão para alterar dados dessa empresa' });
				return;
			}

			const newProduct = await productService.createProduct({
				name,
				description,
				price: parseFloat(price),
				stock: parseInt(stock),
				imageUrl,
				companyId: Number(companyId)
			});

			res.status(201).json(newProduct);
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro inesperado ao criar produto', error });
			}
		}
	}

	static async getAllProducts(req: Request, res: Response): Promise<void> {
		const { companyId } = req.query;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			if (!companyId) {
				res.status(400).json({ message: 'ID da empresa é obrigatório' });
				return;
			}

			const isCompanyValid = await userService.verifyIfUserBelongsToCompany(userId, Number(companyId));

			if (!isCompanyValid) {
				res.status(403).json({ message: 'Sem permissão para acessar produtos dessa empresa' });
				return;
			}

			const products = await productService.getAllProducts(Number(companyId));
			res.status(200).json(products);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar produtos', error });
		}
	}

	static async getProductById(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const product = await productService.getProductById(Number(id));

			if (!product) {
				res.status(404).json({ message: 'Produto não encontrado' });
				return;
			}

			const isCompanyValid = await userService.verifyIfUserBelongsToCompany(userId, product.companyId);

			if (!isCompanyValid) {
				res.status(403).json({ message: 'Sem permissão para acessar esse produto' });
				return;
			}

			res.status(200).json(product);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar produto', error });
		}
	}

	static async updateProduct(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const { name, description, price, stock, imageUrl } = req.body;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const product = await productService.getProductById(Number(id));

			if (!product) {
				res.status(404).json({ message: 'Produto não encontrado' });
				return;
			}

			const isCompanyValid = await userService.verifyIfUserBelongsToCompany(userId, product.companyId);

			if (!isCompanyValid) {
				res.status(403).json({ message: 'Sem permissão para alterar esse produto' });
				return;
			}

			const updatedProduct = await productService.updateProduct(
				Number(id),
				{
					name,
					description,
					price: price ? parseFloat(price) : undefined,
					stock: stock !== undefined ? parseInt(stock) : undefined,
					imageUrl
				}
			);

			res.status(200).json(updatedProduct);
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro ao atualizar produto', error });
			}
		}
	}

	static async updateProductStock(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const { quantity } = req.body;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const product = await productService.getProductById(Number(id));

			if (!product) {
				res.status(404).json({ message: 'Produto não encontrado' });
				return;
			}

			const isCompanyValid = await userService.verifyIfUserBelongsToCompany(userId, product.companyId);

			if (!isCompanyValid) {
				res.status(403).json({ message: 'Sem permissão para alterar esse produto' });
				return;
			}

			if (!quantity || quantity <= 0) {
				res.status(400).json({ message: 'Quantidade deve ser maior que zero' });
				return;
			}

			const updatedProduct = await productService.updateProductStock(Number(id), Number(quantity));
			res.status(200).json(updatedProduct);
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro ao atualizar estoque do produto', error });
			}
		}
	}

	static async deleteProduct(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const product = await productService.getProductById(Number(id));

			if (!product) {
				res.status(404).json({ message: 'Produto não encontrado' });
				return;
			}

			const isCompanyValid = await userService.verifyIfUserBelongsToCompany(userId, product.companyId);

			if (!isCompanyValid) {
				res.status(403).json({ message: 'Sem permissão para excluir esse produto' });
				return;
			}

			await productService.deleteProduct(Number(id));
			res.status(204).send();
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro ao excluir produto', error });
			}
		}
	}

	static async getProductsByCompanySlug(req: Request, res: Response): Promise<void> {
		try {
			const { slug } = req.params;
			if (!slug) {
				res.status(400).json({ message: 'Slug da empresa é obrigatório' });
				return;
			}

			const products = await productService.getProductsByCompanySlug(slug);
			res.status(200).json(products);
		} catch (error) {
			console.error('Erro ao buscar produtos:', error);
			res.status(500).json({ message: 'Erro ao buscar produtos' });
		}
	}
} 