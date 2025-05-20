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
exports.permissionMiddleware = void 0;
const db_1 = __importDefault(require("../config/db/db"));
const permissionMiddleware = (permission) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.userId;
        if (!userId) {
            res.status(400).json({ message: 'User ID não encontrado no token' });
            return;
        }
        const permissions = Array.isArray(permission) ? permission : [permission];
        try {
            const userPermissions = yield db_1.default.permission.findUnique({
                where: { userId },
            });
            if (!userPermissions) {
                res.status(403).json({ message: 'Usuário não tem permissões associadas' });
                return;
            }
            // Adicionar as permissões do usuário à requisição para uso posterior
            const permissionsObject = {};
            // Converter para o formato esperado (ignorando campos não-boolean como id, userId, etc)
            Object.entries(userPermissions).forEach(([key, value]) => {
                if (typeof value === 'boolean') {
                    permissionsObject[key] = value;
                }
            });
            req.userPermissions = permissionsObject;
            for (const perm of permissions) {
                if (!(perm in userPermissions)) {
                    res.status(400).json({ message: `Permissão ${perm} inválida` });
                    return;
                }
                if (userPermissions[perm] !== true) {
                    res.status(403).json({ message: `Acesso negado, sem permissão para ${perm}` });
                    return;
                }
            }
            next();
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao verificar permissão', error });
            return;
        }
    });
};
exports.permissionMiddleware = permissionMiddleware;
