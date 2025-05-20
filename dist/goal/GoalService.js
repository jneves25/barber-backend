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
exports.GoalService = void 0;
const db_1 = __importDefault(require("../config/db/db"));
class GoalService {
    // Check if a goal already exists for this user, month, and year
    checkGoalExists(userId, companyId, month, year) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Verificando meta existente para userId: ${userId}, companyId: ${companyId}, month: ${month}, year: ${year}`);
            // Buscar exatamente pela combinação de userId, companyId, month e year
            const existingGoal = yield db_1.default.goal.findFirst({
                where: {
                    AND: [
                        { userId: Number(userId) },
                        { companyId: Number(companyId) },
                        { month: Number(month) },
                        { year: Number(year) }
                    ],
                    deletedAt: null
                }
            });
            if (existingGoal) {
                console.log('Meta existente encontrada:', JSON.stringify(existingGoal));
            }
            else {
                console.log('Nenhuma meta encontrada com esses parâmetros exatos');
            }
            // Verificar outras metas do usuário para debug
            const userGoals = yield db_1.default.goal.findMany({
                where: {
                    userId: Number(userId),
                    deletedAt: null
                },
                select: {
                    id: true,
                    month: true,
                    year: true,
                    companyId: true
                }
            });
            console.log(`Total de ${userGoals.length} metas encontradas para o usuário ${userId}:`, JSON.stringify(userGoals));
            return !!existingGoal;
        });
    }
    createGoal(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.goal.create({
                data: {
                    userId: data.userId,
                    companyId: data.companyId,
                    month: data.month,
                    year: data.year,
                    target: data.target
                },
                include: {
                    user: true,
                    company: true
                }
            });
        });
    }
    getAllGoals(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.goal.findMany({
                where: {
                    companyId: companyId,
                    deletedAt: null
                },
                include: {
                    user: true,
                    company: true
                }
            });
        });
    }
    getUserGoals(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.goal.findMany({
                where: {
                    userId: userId,
                    deletedAt: null
                },
                include: {
                    user: true,
                    company: true
                }
            });
        });
    }
    getGoalById(goalId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.goal.findUnique({
                where: {
                    id: goalId,
                    deletedAt: null
                },
                include: {
                    user: true,
                    company: true
                }
            });
        });
    }
    updateGoal(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.goal.update({
                where: {
                    id,
                    deletedAt: null
                },
                data: {
                    month: data.month,
                    year: data.year,
                    target: data.target
                },
                include: {
                    user: true,
                    company: true
                }
            });
        });
    }
    deleteGoal(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.goal.update({
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
    // Calculate progress for a specific goal
    getGoalProgress(goalId, customStartDate, customEndDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const goal = yield this.getGoalById(goalId);
            if (!goal)
                return 0;
            // Get all completed appointments for this user in the specified month and year
            // Use custom date range if provided, otherwise use goal's month/year
            const startDate = customStartDate || new Date(goal.year, goal.month - 1, 1);
            const endDate = customEndDate || new Date(goal.year, goal.month, 0); // Last day of the month
            // Add more logs for debugging
            console.log(`Calculating progress for goal ${goalId}, user ${goal.userId}, company ${goal.companyId}`);
            console.log(`Using date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
            const appointments = yield db_1.default.appointment.findMany({
                where: {
                    userId: goal.userId,
                    companyId: goal.companyId,
                    status: 'COMPLETED',
                    scheduledTime: {
                        gte: startDate,
                        lte: endDate
                    },
                    deletedAt: null
                }
            });
            console.log(`Found ${appointments.length} completed appointments for user ${goal.userId}`);
            // Sum up the values of all completed appointments
            const totalValue = appointments.reduce((sum, appointment) => sum + appointment.value, 0);
            console.log(`Total value: ${totalValue}`);
            return totalValue;
        });
    }
    // Calculate progress for multiple goals
    getGoalsProgress(goalIds, customStartDate, customEndDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const progress = {};
            yield Promise.all(goalIds.map((goalId) => __awaiter(this, void 0, void 0, function* () {
                progress[goalId] = yield this.getGoalProgress(goalId, customStartDate, customEndDate);
            })));
            return progress;
        });
    }
    getGoalsByMonthAndYear(companyId, month, year) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.goal.findMany({
                where: {
                    companyId,
                    month,
                    year,
                    deletedAt: null
                },
                include: {
                    user: true,
                    company: true
                }
            });
        });
    }
    getUserGoalsByMonthAndYear(userId, month, year) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.goal.findMany({
                where: {
                    userId,
                    month,
                    year,
                    deletedAt: null
                },
                include: {
                    user: true,
                    company: true
                }
            });
        });
    }
}
exports.GoalService = GoalService;
