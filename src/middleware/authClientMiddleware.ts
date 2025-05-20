import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

export const authClientMiddleware = (req: Request, res: Response, next: NextFunction): void => {
	const token = req.headers.authorization?.split(' ')[1];

	if (!token) {
		res.status(401).json({ message: 'Token não fornecido' });
		return;
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);

		if (typeof decoded === 'object' && 'clientId' in decoded) {
			req.clientId = (decoded as jwt.JwtPayload).clientId;
			return next();
		}

		res.status(401).json({ message: 'Token inválido ou expirado' });
	} catch (error) {
		console.error('Erro ao verificar token do cliente:', error);
		res.status(401).json({ message: 'Token inválido ou expirado', error });
	}
};
