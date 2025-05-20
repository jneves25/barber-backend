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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const db_1 = __importDefault(require("../config/db/db"));
class ProductService {
    createProduct(data) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const company = yield db_1.default.company.findUnique({
                where: {
                    id: data.companyId,
                    deletedAt: null
                }
            });
            if (!company) {
                throw new Error('Empresa não encontrada');
            }
            return yield db_1.default.product.create({
                data: {
                    name: data.name,
                    description: data.description || '',
                    price: data.price,
                    stock: data.stock,
                    imageUrl: data.imageUrl || '',
                    companyId: data.companyId
                }
            });
        });
    }
    getAllProducts(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.product.findMany({
                where: {
                    companyId,
                    deletedAt: null
                },
                orderBy: {
                    name: 'asc'
                }
            });
        });
    }
    getProductById(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.product.findUnique({
                where: {
                    id: productId,
                    deletedAt: null
                }
            });
        });
    }
    getProductsByCompanySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            // Primeiro encontra a empresa pelo slug
            const company = yield db_1.default.company.findUnique({
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
            return yield db_1.default.product.findMany({
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
        });
    }
    updateProduct(productId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const productToUpdate = yield db_1.default.product.findUnique({
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
            return yield db_1.default.product.update({
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
        });
    }
    updateProductStock(productId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield db_1.default.product.findUnique({
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
            return yield db_1.default.product.update({
                where: {
                    id: productId,
                    deletedAt: null
                },
                data: {
                    stock: newStock
                }
            });
        });
    }
    deleteProduct(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if product exists
            const product = yield db_1.default.product.findUnique({
                where: {
                    id: productId,
                    deletedAt: null
                }
            });
            if (!product) {
                throw new Error('Produto não encontrado');
            }
            // Check if product is used in any appointment
            const productAppointments = yield db_1.default.productAppointment.findFirst({
                where: {
                    productId,
                    deletedAt: null
                }
            });
            if (productAppointments) {
                throw new Error('Não é possível excluir um produto que está sendo usado em agendamentos');
            }
            return yield db_1.default.product.update({
                where: {
                    id: productId,
                    deletedAt: null
                },
                data: {
                    deletedAt: new Date()
                }
            });
        });
    }
}
exports.ProductService = ProductService;
