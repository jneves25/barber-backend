import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db/db';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
	static generateToken(userId: number) {
		const payload = { userId };
		return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
	}

	static async verifyPassword(storedPassword: string, password: string): Promise<boolean> {
		return bcrypt.compare(password, storedPassword);
	}

	static async login(email: string, password: string) {
		const user = await prisma.user.findUnique({
			where: { email, deletedAt: null },
		});

		if (!user) {
			throw new Error('Usuário não encontrado');
		}

		const isPasswordValid = await this.verifyPassword(user.password, password);
		if (!isPasswordValid) {
			throw new Error('Senha incorreta');
		}

		const token = this.generateToken(user.id);

		const { password: _, ...userData } = user;

		return { token, user: userData };
	}

	static async register(email: string, name: string, passwordTyped: string) {
		const existingUser = await prisma.user.findUnique({
			where: { email, deletedAt: null },
		});

		if (existingUser) {
			throw new Error('Email já está em uso');
		}

		const hashedPassword = await bcrypt.hash(passwordTyped, 10);

		const user = await prisma.user.create({
			data: {
				email,
				name,
				password: hashedPassword,
			},
		});

		const token = this.generateToken(user.id);

		const { password, ...userData } = user;

		return { token, user: userData };
	}
}
