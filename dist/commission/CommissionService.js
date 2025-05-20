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
exports.CommissionService = void 0;
const db_1 = __importDefault(require("../config/db/db"));
class CommissionService {
    createCommissionConfig(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.commissionConfig.create({
                data: {
                    userId: data.userId,
                    companyId: data.companyId,
                    commissionType: data.commissionType,
                    commissionMode: data.commissionMode,
                    commissionValue: data.commissionValue,
                },
                include: {
                    rules: true,
                    user: true,
                    company: true
                }
            });
        });
    }
    getCommissionConfigById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.commissionConfig.findUnique({
                where: {
                    id,
                    deletedAt: null
                },
                include: {
                    rules: true,
                    user: true,
                    company: true
                }
            });
        });
    }
    getCommissionConfigsByCompany(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.commissionConfig.findMany({
                where: {
                    companyId,
                    deletedAt: null
                },
                include: {
                    rules: true,
                    user: true,
                    company: true
                }
            });
        });
    }
    updateCommissionConfig(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.commissionConfig.update({
                where: {
                    id,
                    deletedAt: null
                },
                data,
                include: {
                    rules: true,
                    user: true,
                    company: true
                }
            });
        });
    }
    deleteCommissionConfig(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.commissionConfig.update({
                where: {
                    id,
                    deletedAt: null
                },
                data: {
                    deletedAt: new Date()
                }
            });
        });
    }
    createCommissionRule(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.commissionRule.create({
                data: {
                    configId: data.configId,
                    serviceId: data.serviceId,
                    percentage: data.percentage
                }
            });
        });
    }
    getCommissionRulesByConfig(configId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.commissionRule.findMany({
                where: {
                    configId,
                    deletedAt: null
                }
            });
        });
    }
    updateCommissionRule(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.commissionRule.update({
                where: {
                    id,
                    deletedAt: null
                },
                data
            });
        });
    }
    deleteCommissionRule(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.commissionRule.update({
                where: {
                    id,
                    deletedAt: null
                },
                data: {
                    deletedAt: new Date()
                }
            });
        });
    }
    createDefaultCommissionConfig(userId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.commissionConfig.create({
                data: {
                    userId,
                    companyId,
                    commissionType: 'GENERAL',
                    commissionMode: 'FIXED',
                    commissionValue: 100,
                }
            });
        });
    }
    getCommissionConfigByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.commissionConfig.findFirst({
                where: {
                    userId: userId,
                    deletedAt: null
                },
                include: {
                    rules: true,
                    user: true,
                    company: true
                }
            });
        });
    }
}
exports.CommissionService = CommissionService;
