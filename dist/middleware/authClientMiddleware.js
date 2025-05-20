"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authClientMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const authClientMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Token não fornecido' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (typeof decoded === 'object' && 'clientId' in decoded) {
            req.clientId = decoded.clientId;
            return next();
        }
        res.status(401).json({ message: 'Token inválido ou expirado' });
    }
    catch (error) {
        console.error('Erro ao verificar token do cliente:', error);
        res.status(401).json({ message: 'Token inválido ou expirado', error });
    }
};
exports.authClientMiddleware = authClientMiddleware;
