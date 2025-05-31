import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
	const token = req.headers.authorization?.split(' ')[1];

	if (!token) {
		res.status(401).json({ message: 'Token não fornecido' });
		return;
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);

		if (typeof decoded === 'object' && 'userId' in decoded) {
			req.userId = (decoded as jwt.JwtPayload).userId;
			return next();
		}

		res.status(401).json({ message: 'Token inválido ou expirado' });
	} catch (error) {
		console.error('Erro ao verificar token:', error);
		res.status(401).json({ message: 'Token inválido ou expirado', error });
	}
}; 