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
exports.CompanyMemberService = void 0;
// src/services/CompanyMemberService.ts
const db_1 = __importDefault(require("../config/db/db"));
class CompanyMemberService {
    // Adicionar um membro ao time
    addMemberToCompany(companyId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const CompanyMember = yield db_1.default.companyMember.create({
                data: {
                    companyId,
                    userId,
                },
            });
            return CompanyMember;
        });
    }
    // Obter todos os membros de um time
    getMembersByCompanyId(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const members = yield db_1.default.companyMember.findMany({
                where: {
                    companyId,
                    deletedAt: null
                },
                include: {
                    user: true, // Para incluir as informações do usuário
                },
            });
            return members;
        });
    }
    // Remover um membro do time
    removeMemberFromCompany(companyId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const removedMember = yield db_1.default.companyMember.update({
                where: {
                    companyId_userId: { companyId, userId },
                    deletedAt: null
                },
                data: {
                    deletedAt: new Date()
                }
            });
            return removedMember;
        });
    }
}
exports.CompanyMemberService = CompanyMemberService;
