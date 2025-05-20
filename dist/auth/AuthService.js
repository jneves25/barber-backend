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
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db/db"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const JWT_EXPIRES_IN = '7d';
class AuthService {
    static generateToken(userId) {
        const payload = { userId };
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
    static verifyPassword(storedPassword, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcryptjs_1.default.compare(password, storedPassword);
        });
    }
    static login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.default.user.findUnique({
                where: { email, deletedAt: null },
            });
            if (!user) {
                throw new Error('Usuário não encontrado');
            }
            const isPasswordValid = yield this.verifyPassword(user.password, password);
            if (!isPasswordValid) {
                throw new Error('Senha incorreta');
            }
            const token = this.generateToken(user.id);
            const { password: _ } = user, userData = __rest(user, ["password"]);
            return { token, user: userData };
        });
    }
    static register(email, name, passwordTyped) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield db_1.default.user.findUnique({
                where: { email, deletedAt: null },
            });
            if (existingUser) {
                throw new Error('Email já está em uso');
            }
            const hashedPassword = yield bcryptjs_1.default.hash(passwordTyped, 10);
            const user = yield db_1.default.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                },
            });
            const token = this.generateToken(user.id);
            const { password } = user, userData = __rest(user, ["password"]);
            return { token, user: userData };
        });
    }
}
exports.AuthService = AuthService;
