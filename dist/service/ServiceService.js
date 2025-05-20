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
exports.ServiceService = void 0;
const db_1 = __importDefault(require("../config/db/db"));
class ServiceService {
    createService(data) {
        return __awaiter(this, void 0, void 0, function* () {
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
            return yield db_1.default.service.create({
                data: {
                    name: data.name,
                    price: data.price,
                    duration: data.duration,
                    description: data.description || '',
                    companyId: data.companyId
                }
            });
        });
    }
    getAllServices(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.service.findMany({
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
    getServiceById(serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.service.findUnique({
                where: {
                    id: serviceId,
                    deletedAt: null
                }
            });
        });
    }
    getServicesByCompanySlug(slug) {
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
            // Busca os serviços ativos dessa empresa
            return yield db_1.default.service.findMany({
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
        });
    }
    updateService(serviceId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceToUpdate = yield db_1.default.service.findUnique({
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
            return yield db_1.default.service.update({
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
        });
    }
    deleteService(serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if service exists
            const service = yield db_1.default.service.findUnique({
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
            yield db_1.default.commissionRule.deleteMany({
                where: {
                    serviceId,
                    deletedAt: null
                }
            });
            return yield db_1.default.service.update({
                where: {
                    id: serviceId,
                    deletedAt: null
                },
                data: {
                    deletedAt: new Date()
                }
            });
        });
    }
}
exports.ServiceService = ServiceService;
