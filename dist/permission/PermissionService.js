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
exports.PermissionService = void 0;
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../config/db/db"));
class PermissionService {
    assignPermissionsToUser(userId, role, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            // Dados padrão de permissão, tudo negado - exatamente conforme o schema
            const permissionData = {
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
                viewOwnStatistics: true, // default true no schema
                manageSettings: false,
                viewUsers: false,
                manageUsers: false
            };
            // Permissões baseadas no papel (role)
            if (role === client_1.RoleEnum.ADMIN) {
                // Admin tem todas as permissões
                Object.keys(permissionData).forEach(key => {
                    permissionData[key] = true;
                });
            }
            else if (role === client_1.RoleEnum.MANAGER) {
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
            }
            else if (role === client_1.RoleEnum.USER) {
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
                const existingPermission = yield db_1.default.permission.findFirst({
                    where: {
                        userId,
                        deletedAt: null
                    }
                });
                let userPermissions;
                if (existingPermission) {
                    // Atualizar permissões existentes
                    userPermissions = yield db_1.default.permission.update({
                        where: {
                            id: existingPermission.id
                        },
                        data: permissionData
                    });
                }
                else {
                    // Criar novas permissões
                    userPermissions = yield db_1.default.permission.create({
                        data: Object.assign({ userId }, permissionData)
                    });
                }
                console.log('Permissões atribuídas com sucesso ao usuário!');
                return userPermissions;
            }
            catch (error) {
                console.error('Erro ao atribuir permissões ao usuário:', error);
                throw new Error('Erro ao atribuir permissões ao usuário');
            }
        });
    }
    createPermission(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.permission.create({
                data,
            });
        });
    }
    getAllPermissions() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.permission.findMany();
        });
    }
    getPermissionById(permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.permission.findUnique({
                where: {
                    id: permissionId,
                    deletedAt: null
                },
            });
        });
    }
    updatePermission(permissionId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.permission.update({
                where: {
                    id: permissionId,
                    deletedAt: null
                },
                data,
            });
        });
    }
    deletePermission(permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.permission.update({
                where: {
                    id: permissionId,
                    deletedAt: null
                },
                data: {
                    deletedAt: new Date()
                }
            });
        });
    }
    getUserPermissions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.permission.findUnique({
                where: {
                    userId,
                    deletedAt: null
                }
            });
        });
    }
}
exports.PermissionService = PermissionService;
