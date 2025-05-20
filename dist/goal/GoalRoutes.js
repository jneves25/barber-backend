"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/GoalRoutes.ts
const express_1 = require("express");
const GoalController_1 = require("./GoalController");
const authAdminMiddleware_1 = require("../middleware/authAdminMiddleware");
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = (0, express_1.Router)();
router.post('/', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageGoals'), GoalController_1.GoalController.createGoal);
router.get('/', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewAllGoals'), GoalController_1.GoalController.getAllGoals);
router.get('/user', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewOwnGoals'), GoalController_1.GoalController.getUserGoals);
router.get('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewAllGoals'), GoalController_1.GoalController.getGoalById);
router.put('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageGoals'), GoalController_1.GoalController.updateGoal);
router.delete('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageGoals'), GoalController_1.GoalController.deleteGoal);
router.get('/:id/progress', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)(['viewAllGoals', 'viewOwnGoals']), GoalController_1.GoalController.getGoalProgress);
router.post('/progress', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)(['viewAllGoals', 'viewOwnGoals']), GoalController_1.GoalController.getGoalsProgress);
exports.default = router;
