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
exports.CommissionController = void 0;
const CommissionService_1 = require("./CommissionService");
const commissionService = new CommissionService_1.CommissionService();
class CommissionController {
    static createCommissionConfig(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const commissionConfig = yield commissionService.createCommissionConfig(data);
                res.status(201).json(commissionConfig);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao criar configuração de comissão', error });
            }
        });
    }
    static getCommissionConfigById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const commissionConfig = yield commissionService.getCommissionConfigById(parseInt(id));
                if (commissionConfig) {
                    res.status(200).json(commissionConfig);
                }
                else {
                    res.status(404).json({ message: 'Configuração de comissão não encontrada' });
                }
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao obter configuração de comissão', error });
            }
        });
    }
    static getCommissionConfigsByCompany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId } = req.query;
            const userId = req.userId;
            try {
                if (!userId || !companyId) {
                    res.status(400).json({ message: 'Parâmetros inválidos' });
                    return;
                }
                const commissionConfigs = yield commissionService.getCommissionConfigsByCompany(Number(companyId));
                res.status(200).json(commissionConfigs);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao obter configurações de comissão', error });
            }
        });
    }
    static updateCommissionConfig(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const data = req.body;
                console.log(data);
                const updatedConfig = yield commissionService.updateCommissionConfig(parseInt(id), data);
                console.log(updatedConfig);
                res.status(200).json(updatedConfig);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao atualizar configuração de comissão', error });
            }
        });
    }
    static deleteCommissionConfig(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield commissionService.deleteCommissionConfig(parseInt(id));
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao deletar configuração de comissão', error });
            }
        });
    }
    static createCommissionRule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const commissionRule = yield commissionService.createCommissionRule(data);
                res.status(201).json(commissionRule);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao criar regra de comissão', error });
            }
        });
    }
    static getCommissionRulesByConfig(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { commissionId } = req.params;
                const commissionRules = yield commissionService.getCommissionRulesByConfig(parseInt(commissionId));
                res.status(200).json(commissionRules);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao obter regras de comissão', error });
            }
        });
    }
    static updateCommissionRule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const data = req.body;
                const updatedRule = yield commissionService.updateCommissionRule(parseInt(id), data);
                res.status(200).json(updatedRule);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao atualizar regra de comissão', error });
            }
        });
    }
    static deleteCommissionRule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield commissionService.deleteCommissionRule(parseInt(id));
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao deletar regra de comissão', error });
            }
        });
    }
    static getCommissionConfigByUserId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const commissionConfig = yield commissionService.getCommissionConfigByUserId(parseInt(userId));
                if (commissionConfig) {
                    res.status(200).json(commissionConfig);
                }
                else {
                    res.status(404).json({ message: 'Configuração de comissão não encontrada para este usuário' });
                }
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao obter configuração de comissão do usuário', error });
            }
        });
    }
}
exports.CommissionController = CommissionController;
