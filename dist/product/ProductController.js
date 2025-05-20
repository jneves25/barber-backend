"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const ProductService_1 = require("./ProductService");
const UserService_1 = require("../users/UserService");
const productService = new ProductService_1.ProductService();
const userService = new UserService_1.UserService();
class ProductController {
    static createProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description, price, stock, imageUrl, companyId } = req.body;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const isCompanyValid = yield userService.verifyIfUserBelongsToCompany(userId, Number(companyId));
                if (!isCompanyValid) {
                    res.status(403).json({ message: 'Sem permissão para alterar dados dessa empresa' });
                    return;
                }
                const newProduct = yield productService.createProduct({
                    name,
                    description,
                    price: parseFloat(price),
                    stock: parseInt(stock),
                    imageUrl,
                    companyId: Number(companyId)
                });
                res.status(201).json(newProduct);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro inesperado ao criar produto', error });
                }
            }
        });
    }
    static getAllProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const isCompanyValid = yield userService.verifyIfUserBelongsToCompany(userId, Number(companyId));
                if (!isCompanyValid) {
                    res.status(403).json({ message: 'Sem permissão para acessar produtos dessa empresa' });
                    return;
                }
                const products = yield productService.getAllProducts(Number(companyId));
                res.status(200).json(products);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar produtos', error });
            }
        });
    }
    static getProductById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const product = yield productService.getProductById(Number(id));
                if (!product) {
                    res.status(404).json({ message: 'Produto não encontrado' });
                    return;
                }
                const isCompanyValid = yield userService.verifyIfUserBelongsToCompany(userId, product.companyId);
                if (!isCompanyValid) {
                    res.status(403).json({ message: 'Sem permissão para acessar esse produto' });
                    return;
                }
                res.status(200).json(product);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao buscar produto', error });
            }
        });
    }
    static updateProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, description, price, stock, imageUrl } = req.body;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const product = yield productService.getProductById(Number(id));
                if (!product) {
                    res.status(404).json({ message: 'Produto não encontrado' });
                    return;
                }
                const isCompanyValid = yield userService.verifyIfUserBelongsToCompany(userId, product.companyId);
                if (!isCompanyValid) {
                    res.status(403).json({ message: 'Sem permissão para alterar esse produto' });
                    return;
                }
                const updatedProduct = yield productService.updateProduct(Number(id), {
                    name,
                    description,
                    price: price ? parseFloat(price) : undefined,
                    stock: stock !== undefined ? parseInt(stock) : undefined,
                    imageUrl
                });
                res.status(200).json(updatedProduct);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro ao atualizar produto', error });
                }
            }
        });
    }
    static updateProductStock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { quantity } = req.body;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const product = yield productService.getProductById(Number(id));
                if (!product) {
                    res.status(404).json({ message: 'Produto não encontrado' });
                    return;
                }
                const isCompanyValid = yield userService.verifyIfUserBelongsToCompany(userId, product.companyId);
                if (!isCompanyValid) {
                    res.status(403).json({ message: 'Sem permissão para alterar esse produto' });
                    return;
                }
                if (!quantity || quantity <= 0) {
                    res.status(400).json({ message: 'Quantidade deve ser maior que zero' });
                    return;
                }
                const updatedProduct = yield productService.updateProductStock(Number(id), Number(quantity));
                res.status(200).json(updatedProduct);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro ao atualizar estoque do produto', error });
                }
            }
        });
    }
    static deleteProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const product = yield productService.getProductById(Number(id));
                if (!product) {
                    res.status(404).json({ message: 'Produto não encontrado' });
                    return;
                }
                const isCompanyValid = yield userService.verifyIfUserBelongsToCompany(userId, product.companyId);
                if (!isCompanyValid) {
                    res.status(403).json({ message: 'Sem permissão para excluir esse produto' });
                    return;
                }
                yield productService.deleteProduct(Number(id));
                res.status(204).send();
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'Erro ao excluir produto', error });
                }
            }
        });
    }
    static getProductsByCompanySlug(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { slug } = req.params;
                if (!slug) {
                    res.status(400).json({ message: 'Slug da empresa é obrigatório' });
                    return;
                }
                const products = yield productService.getProductsByCompanySlug(slug);
                res.status(200).json(products);
            }
            catch (error) {
                console.error('Erro ao buscar produtos:', error);
                res.status(500).json({ message: 'Erro ao buscar produtos' });
            }
        });
    }
}
exports.ProductController = ProductController;
