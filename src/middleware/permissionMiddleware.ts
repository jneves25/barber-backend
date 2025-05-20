import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db/db';

export const permissionMiddleware = (permission: string | string[]) => {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const userId = req.userId;

		if (!userId) {
			res.status(400).json({ message: 'User ID não encontrado no token' });
			return;
		}

		const permissions = Array.isArray(permission) ? permission : [permission];

		try {
			const userPermissions = await prisma.permission.findUnique({
				where: { userId },
			});

			if (!userPermissions) {
				res.status(403).json({ message: 'Usuário não tem permissões associadas' });
				return;
			}

			// Adicionar as permissões do usuário à requisição para uso posterior
			const permissionsObject: { [key: string]: boolean } = {};

			// Converter para o formato esperado (ignorando campos não-boolean como id, userId, etc)
			Object.entries(userPermissions).forEach(([key, value]) => {
				if (typeof value === 'boolean') {
					permissionsObject[key] = value;
				}
			});

			req.userPermissions = permissionsObject;

			for (const perm of permissions) {
				if (!(perm in userPermissions)) {
					res.status(400).json({ message: `Permissão ${perm} inválida` });
					return;
				}

				if (userPermissions[perm as keyof typeof userPermissions] !== true) {
					res.status(403).json({ message: `Acesso negado, sem permissão para ${perm}` });
					return;
				}
			}

			next();
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: 'Erro ao verificar permissão', error });
			return
		}
	};
};
