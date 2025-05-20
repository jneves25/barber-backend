// src/routes/GoalRoutes.ts
import { Router } from 'express';
import { GoalController } from './GoalController';
import { authAdminMiddleware } from '../middleware/authAdminMiddleware';
import { permissionMiddleware } from '../middleware/permissionMiddleware';

const router = Router();

router.post('/', authAdminMiddleware, permissionMiddleware('manageGoals'), GoalController.createGoal);
router.get('/', authAdminMiddleware, permissionMiddleware('viewAllGoals'), GoalController.getAllGoals);
router.get('/user', authAdminMiddleware, permissionMiddleware('viewOwnGoals'), GoalController.getUserGoals);
router.get('/:id', authAdminMiddleware, permissionMiddleware('viewAllGoals'), GoalController.getGoalById);
router.put('/:id', authAdminMiddleware, permissionMiddleware('manageGoals'), GoalController.updateGoal);
router.delete('/:id', authAdminMiddleware, permissionMiddleware('manageGoals'), GoalController.deleteGoal);
router.get('/:id/progress', authAdminMiddleware, permissionMiddleware(['viewAllGoals', 'viewOwnGoals']), GoalController.getGoalProgress);
router.post('/progress', authAdminMiddleware, permissionMiddleware(['viewAllGoals', 'viewOwnGoals']), GoalController.getGoalsProgress);

export default router;