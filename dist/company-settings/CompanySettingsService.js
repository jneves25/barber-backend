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
exports.CompanySettingsService = void 0;
const db_1 = __importDefault(require("../config/db/db"));
class CompanySettingsService {
    createSettings(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const workingHours = yield db_1.default.workingHours.findUnique({
                where: {
                    id: data.workingHoursId,
                    deletedAt: null
                }
            });
            if (!workingHours) {
                throw new Error('Working hours not found');
            }
            return yield db_1.default.companySettings.create({
                data: {
                    companyId: data.companyId,
                    appointmentIntervalMinutes: data.appointmentIntervalMinutes || 30,
                    advanceNoticeDays: data.advanceNoticeDays || 1,
                    preparationTimeMinutes: data.preparationTimeMinutes || 15,
                    sendReminderWhatsApp: data.sendReminderWhatsApp || true,
                    confirmAppointmentWhatsApp: data.confirmAppointmentWhatsApp || true,
                    notifyBarberNewAppointments: data.notifyBarberNewAppointments || true,
                    acceptedPaymentMethods: data.acceptedPaymentMethods || '[]',
                    commissionPercentage: data.commissionPercentage || 10.0,
                    commissionPaymentFrequency: data.commissionPaymentFrequency || 'quinzenal',
                    allowEarlyPaymentOnline: data.allowEarlyPaymentOnline || false,
                    requireDepositConfirmation: data.requireDepositConfirmation || true,
                    applyDiscountForCashPayment: data.applyDiscountForCashPayment || true,
                    workingHoursId: data.workingHoursId
                },
                include: {
                    workingHours: true
                }
            });
        });
    }
    getSettingsByCompanyId(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.companySettings.findFirst({
                where: {
                    companyId,
                    deletedAt: null
                },
                include: {
                    workingHours: true
                }
            });
        });
    }
    updateSettings(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.companySettings.update({
                where: {
                    id,
                    deletedAt: null
                },
                data,
                include: {
                    workingHours: true
                }
            });
        });
    }
    deleteSettings(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.default.companySettings.update({
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
}
exports.CompanySettingsService = CompanySettingsService;
