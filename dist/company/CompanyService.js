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
exports.CompanyService = void 0;
const db_1 = __importDefault(require("../config/db/db"));
class CompanyService {
    constructor() {
        this.slugify = (name) => {
            // Converter nome para minúsculas e substituir espaços por hífens
            const baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            // Adicionar 6 caracteres aleatórios ao final para garantir unicidade
            const randomChars = Math.random().toString(36).substring(2, 8);
            return `${baseSlug}-${randomChars}`;
        };
    }
    createCompany(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Gerar uma slug baseada no nome se não for fornecida
            const slug = data.slug || this.slugify(data.name);
            const company = yield db_1.default.company.create({
                data: {
                    ownerId: data.ownerId,
                    name: data.name,
                    address: data.address,
                    slug: slug
                },
            });
            const workHoursSettings = yield db_1.default.workingHours.create({});
            const companySettings = yield db_1.default.companySettings.create({
                data: {
                    companyId: company.id,
                    workingHoursId: workHoursSettings.id
                },
            });
            // Add owner as a company member
            yield db_1.default.companyMember.create({
                data: {
                    companyId: company.id,
                    userId: data.ownerId
                }
            });
            const updatedCompany = yield db_1.default.company.update({
                where: { id: company.id },
                data: {
                    settingsId: companySettings.id,
                },
            });
            return updatedCompany;
        });
    }
    getAllCompanys(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.company.findMany({
                where: {
                    ownerId: id,
                    deletedAt: null
                }
            });
        });
    }
    getCompanyById(CompanyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.company.findUnique({
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
        });
    }
    getCompanyByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.company.findMany({
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
        });
    }
    getCompanyWithMembers(CompanyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.company.findUnique({
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
        });
    }
    getCompanyBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.company.findUnique({
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
        });
    }
    updateCompany(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.company.update({
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
        });
    }
}
exports.CompanyService = CompanyService;
