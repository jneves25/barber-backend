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
exports.CompanySettingsController = void 0;
const CompanySettingsService_1 = require("./CompanySettingsService");
const UserService_1 = require("../users/UserService");
const client_1 = require("@prisma/client");
const companySettingsService = new CompanySettingsService_1.CompanySettingsService();
const userService = new UserService_1.UserService();
class CompanySettingsController {
    static createSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, appointmentIntervalMinutes, advanceNoticeDays, preparationTimeMinutes, sendReminderWhatsApp, confirmAppointmentWhatsApp, notifyBarberNewAppointments, acceptedPaymentMethods, commissionPercentage, commissionPaymentFrequency, allowEarlyPaymentOnline, requireDepositConfirmation, applyDiscountForCashPayment, workingHoursId } = req.body;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const userData = yield userService.getUserById(userId);
                if (!userData) {
                    res.status(403).json({ message: "Usuário não encontrado" });
                    return;
                }
                if (userData.role !== client_1.RoleEnum.ADMIN) {
                    res.status(400).json({ message: "Apenas administradores podem criar configurações" });
                    return;
                }
                if (!companyId) {
                    throw new Error("É obrigatório enviar o ID da empresa");
                }
                const settings = yield companySettingsService.createSettings({
                    companyId,
                    appointmentIntervalMinutes,
                    advanceNoticeDays,
                    preparationTimeMinutes,
                    sendReminderWhatsApp,
                    confirmAppointmentWhatsApp,
                    notifyBarberNewAppointments,
                    acceptedPaymentMethods,
                    commissionPercentage,
                    commissionPaymentFrequency,
                    allowEarlyPaymentOnline,
                    requireDepositConfirmation,
                    applyDiscountForCashPayment,
                    workingHoursId
                });
                res.status(201).json(settings);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(422).json({ message: error.message });
                }
                else {
                    res.status(400).json({ message: 'Erro inesperado ao criar configurações' });
                }
            }
        });
    }
    static getSettingsByCompanyId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId } = req.params;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const settings = yield companySettingsService.getSettingsByCompanyId(parseInt(companyId));
                if (settings) {
                    res.status(200).json(settings);
                }
                else {
                    res.status(404).json({ message: 'Configurações não encontradas' });
                }
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao obter configurações', error });
            }
        });
    }
    static updateSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const updateData = req.body;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                const settings = yield companySettingsService.updateSettings(parseInt(id), updateData);
                if (settings) {
                    res.status(200).json(settings);
                }
                else {
                    res.status(404).json({ message: 'Configurações não encontradas' });
                }
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao atualizar configurações', error });
            }
        });
    }
    static deleteSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const userId = req.userId;
            try {
                if (!userId) {
                    res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
                    return;
                }
                yield companySettingsService.deleteSettings(parseInt(id));
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao deletar configurações', error });
            }
        });
    }
}
exports.CompanySettingsController = CompanySettingsController;
