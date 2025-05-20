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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const db_1 = __importDefault(require("../config/db/db")); // Importando Prisma Client
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
class UserService {
    createUserWithPermissions(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcryptjs_1.default.hash(data.password, 10);
            const existingUser = yield db_1.default.user.findUnique({
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
            }
            else {
                const validRoles = Object.values(client_1.RoleEnum);
                if (!validRoles.includes(data.role)) {
                    throw new Error('Cargo enviado inválido');
                }
            }
            if (!data.password) {
                throw new Error('É preciso enviar uma senha para o novo usuário');
            }
            // Criação do usuário
            const newUser = yield db_1.default.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                    role: data.role,
                    password: hashedPassword,
                },
            });
            // Retornando o novo usuário, sem a senha
            const { password } = newUser, newUserData = __rest(newUser, ["password"]);
            return newUserData;
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.user.findMany({
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
        });
    }
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.default.user.findUnique({
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
            if (!user)
                return null;
            const companyMembers = yield db_1.default.companyMember.findMany({
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
                    members: Array.isArray(company.members) ? company.members.map((member) => ({
                        id: member.user.id,
                        name: member.user.name,
                        email: member.user.email,
                        role: member.user.role,
                    })) : [],
                })),
                permissions: user.permissions,
                commissionConfigs: user.commissionConfigs
            };
        });
    }
    static updateUser(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const userToUpdate = yield db_1.default.user.findUnique({
                where: {
                    id: userId,
                    deletedAt: null
                },
            });
            if (!userToUpdate) {
                throw new Error('Usuário não encontrado');
            }
            if (data.role && data.role === client_1.RoleEnum.ADMIN) {
                throw new Error('Não é possível alterar o cargo para administrador');
            }
            const updatedUser = yield db_1.default.user.update({
                where: {
                    id: userId,
                    deletedAt: null
                },
                data: {
                    email: data.email || userToUpdate.email,
                    name: data.name || userToUpdate.name,
                    password: data.password ? yield bcryptjs_1.default.hash(data.password, 10) : userToUpdate.password,
                    role: data.role || userToUpdate.role,
                },
            });
            const { password } = updatedUser, newUserData = __rest(updatedUser, ["password"]);
            return newUserData;
        });
    }
    static deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userToDelete = yield db_1.default.user.findUnique({
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
            yield db_1.default.permission.update({
                where: { userId, deletedAt: null },
                data: {
                    deletedAt: new Date()
                }
            });
            yield db_1.default.companyMember.deleteMany({
                where: { userId },
            });
            yield db_1.default.user.update({
                where: { id: userId, deletedAt: null },
                data: {
                    deletedAt: new Date()
                }
            });
        });
    }
    verifyIfCompanyIsValidOnUserRegistration(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.default.user.findUnique({
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
            const ownedCompanies = yield db_1.default.company.findMany({
                where: { ownerId: userId }
            });
            // Get companies where user is member
            const memberCompanies = yield db_1.default.companyMember.findMany({
                where: { userId }
            });
            return ownedCompanies.length > 0 || memberCompanies.length > 0;
        });
    }
    verifyIfUserBelongsToCompany(userId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verifica se o usuário existe
            const user = yield db_1.default.user.findUnique({
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
            const company = yield db_1.default.company.findUnique({
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
            const isOwner = yield db_1.default.company.findFirst({
                where: {
                    id: companyId,
                    ownerId: userId,
                    deletedAt: null
                }
            });
            // Verifica se o usuário é membro da empresa
            const isMember = yield db_1.default.companyMember.findFirst({
                where: {
                    companyId: companyId,
                    userId: userId,
                    deletedAt: null
                }
            });
            return !!isOwner || !!isMember;
        });
    }
    getUsersByCompany(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            // First, find all company members
            const companyMembers = yield db_1.default.companyMember.findMany({
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
            const company = yield db_1.default.company.findUnique({
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
            if (!company)
                return [];
            // Transform to user objects
            const memberUsers = companyMembers.map(member => member.user);
            // Make sure we don't add the owner twice if they are also a member
            const ownerAlreadyInMembers = memberUsers.some(user => user.id === company.owner.id);
            // Return all users including owner (unless owner is already in members list)
            return ownerAlreadyInMembers
                ? memberUsers
                : [company.owner, ...memberUsers];
        });
    }
}
exports.UserService = UserService;
