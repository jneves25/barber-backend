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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyMemberController = void 0;
const CompanyMemberService_1 = require("./CompanyMemberService");
const companyMemberService = new CompanyMemberService_1.CompanyMemberService();
class CompanyMemberController {
    static addMember(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { CompanyId, userId } = req.body;
            try {
                const member = yield companyMemberService.addMemberToCompany(CompanyId, userId);
                res.status(201).json(member);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao adicionar membro ao time', error });
            }
        });
    }
    static getMembers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { CompanyId } = req.params;
            try {
                const members = yield companyMemberService.getMembersByCompanyId(parseInt(CompanyId));
                res.status(200).json(members);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao obter membros do time', error });
            }
        });
    }
    static removeMember(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { CompanyId, userId } = req.body;
            try {
                const removedMember = yield companyMemberService.removeMemberFromCompany(CompanyId, userId);
                res.status(200).json(removedMember);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao remover membro do time', error });
            }
        });
    }
}
exports.CompanyMemberController = CompanyMemberController;
