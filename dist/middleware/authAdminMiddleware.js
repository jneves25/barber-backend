"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authAdminMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const authAdminMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // Extrair o token do cabeçalho Authorization
    if (!token) {
        res.status(401).json({ message: 'Token não fornecido' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET); // Verifica o token
        if (typeof decoded === 'object' && 'userId' in decoded) {
            req.userId = decoded.userId; // Adiciona o userId no req para uso posterior
            return next(); // Passa a execução para o próximo middleware ou controlador
        }
        res.status(401).json({ message: 'Token inválido ou expirado' });
    }
    catch (error) {
        console.error('Erro ao verificar token:', error);
        res.status(401).json({ message: 'Token inválido ou expirado', error });
    }
};
exports.authAdminMiddleware = authAdminMiddleware;
