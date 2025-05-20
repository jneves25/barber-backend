import prisma from '../config/db/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const JWT_EXPIRES_IN = '7d';

export class ClientService {
	static generateToken(clientId: number) {
		const payload = { clientId };
		return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
	}

	static async verifyPassword(storedPassword: string, password: string): Promise<boolean> {
		return bcrypt.compare(password, storedPassword);
	}

	async registerClient(data: { name: string; email: string; phone: string; password: string }) {
		// Check if email is already in use
		const existingClient = await prisma.client.findUnique({
			where: { email: data.email }
		});

		if (existingClient) {
			throw new Error('Email já está em uso por outro cliente');
		}

		// Validate required fields
		if (!data.name) {
			throw new Error('Nome do cliente é obrigatório');
		}

		if (!data.email) {
			throw new Error('Email do cliente é obrigatório');
		}

		if (!data.phone) {
			throw new Error('Telefone do cliente é obrigatório');
		}

		if (!data.password) {
			throw new Error('Senha do cliente é obrigatória');
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(data.password, 10);

		const client = await prisma.client.create({
			data: {
				name: data.name,
				email: data.email,
				phone: data.phone,
				password: hashedPassword
			}
		});

		// Generate JWT token
		const token = ClientService.generateToken(client.id);

		// Return client data without password
		const { password, ...clientData } = client;
		return { token, client: clientData };
	}

	async loginClient(email: string, password: string) {
		const client = await prisma.client.findUnique({
			where: { email, deletedAt: null }
		});

		if (!client) {
			throw new Error('Cliente não encontrado');
		}

		if (!client.password) {
			throw new Error('Primeiro acesso do cliente, por favor tente trocar a senha!');
		}

		const isPasswordValid = await ClientService.verifyPassword(client.password, password);
		if (!isPasswordValid) {
			throw new Error('Senha incorreta');
		}

		const token = ClientService.generateToken(client.id);

		// Return client data without password
		const { password: _, ...clientData } = client;
		return { token, client: clientData };
	}

	async createClient(data: { name: string; email: string; phone: string; password: string }) {
		// Check if email is already in use
		const existingClient = await prisma.client.findUnique({
			where: { email: data.email, deletedAt: null }
		});

		if (existingClient) {
			throw new Error('Email já está em uso por outro cliente');
		}

		// Validate required fields
		if (!data.name) {
			throw new Error('Nome do cliente é obrigatório');
		}

		if (!data.email) {
			throw new Error('Email do cliente é obrigatório');
		}

		if (!data.phone) {
			throw new Error('Telefone do cliente é obrigatório');
		}

		if (!data.password) {
			throw new Error('Senha do cliente é obrigatória');
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(data.password, 10);

		const client = await prisma.client.create({
			data: {
				name: data.name,
				email: data.email,
				phone: data.phone,
				password: hashedPassword
			}
		});

		// Return client data without password
		const { password, ...clientData } = client;
		return clientData;
	}

	async getAllClients() {
		const clients = await prisma.client.findMany({
			include: {
				appointments: {
					select: {
						id: true,
						value: true,
						status: true,
						createdAt: true
					}
				}
			}
		});

		// Remove password from all clients
		return clients.map(client => {
			const { password, ...clientData } = client;
			return clientData;
		});
	}

	async getClientById(clientId: number) {
		const client = await prisma.client.findUnique({
			where: {
				id: clientId,
				deletedAt: null
			},
			include: {
				appointments: {
					select: {
						id: true,
						value: true,
						status: true,
						createdAt: true,
						services: {
							include: {
								service: true
							}
						},
						products: {
							include: {
								product: true
							}
						}
					}
				}
			}
		});

		if (!client) return null;

		// Remove password from client data
		const { password, ...clientData } = client;
		return clientData;
	}

	async getClientsByBarber(userId: number) {
		// Get clients that have appointments with this barber
		const appointments = await prisma.appointment.findMany({
			where: {
				userId,
				deletedAt: null
			},
			select: {
				clientId: true
			},
			distinct: ['clientId']
		});

		const clientIds = appointments.map(appointment => appointment.clientId);

		const clients = await prisma.client.findMany({
			where: {
				id: {
					in: clientIds
				}
			},
			include: {
				appointments: {
					where: {
						userId,
						deletedAt: null
					},
					select: {
						id: true,
						value: true,
						status: true,
						createdAt: true
					}
				}
			}
		});

		// Remove password from all clients
		return clients.map(client => {
			const { password, ...clientData } = client;
			return clientData;
		});
	}

	async updateClient(clientId: number, data: { name?: string; email?: string; phone?: string; password?: string }) {
		const clientToUpdate = await prisma.client.findUnique({
			where: { id: clientId, deletedAt: null }
		});

		if (!clientToUpdate) {
			throw new Error('Cliente não encontrado');
		}

		// If email is being updated, check if it's already in use
		if (data.email && data.email !== clientToUpdate.email) {
			const existingClient = await prisma.client.findUnique({
				where: { email: data.email, deletedAt: null }
			});

			if (existingClient) {
				throw new Error('Email já está em uso por outro cliente');
			}
		}

		// Prepare the data to update
		const updateData: any = {
			name: data.name || clientToUpdate.name,
			email: data.email || clientToUpdate.email,
			phone: data.phone || clientToUpdate.phone
		};

		// If password is being updated, hash it
		if (data.password) {
			updateData.password = await bcrypt.hash(data.password, 10);
		}

		const updatedClient = await prisma.client.update({
			where: { id: clientId, deletedAt: null },
			data: updateData
		});

		// Remove password from client data
		const { password, ...clientData } = updatedClient;
		return clientData;
	}

	async deleteClient(clientId: number) {
		const client = await prisma.client.findUnique({
			where: { id: clientId, deletedAt: null },
			include: {
				appointments: true
			}
		});

		if (!client) {
			throw new Error('Cliente não encontrado');
		}

		// Check if client has appointments
		if (client.appointments.length > 0) {
			throw new Error('Não é possível excluir um cliente com agendamentos');
		}

		const deletedClient = await prisma.client.update({
			where: { id: clientId, deletedAt: null },
			data: {
				deletedAt: new Date()
			}
		});

		// Remove password from client data
		const { password, ...clientData } = deletedClient;
		return clientData;
	}

	async getAllClientsByCompany(companyId: number) {
		const appointments = await prisma.appointment.findMany({
			where: {
				companyId: companyId,
				deletedAt: null
			},
			select: {
				clientId: true
			},
			distinct: ['clientId']
		});

		// Extrai os IDs dos clientes
		const clientIds = appointments.map(appointment => appointment.clientId);

		// Busca os clientes
		const clients = await prisma.client.findMany({
			where: {
				OR: [
					{ id: { in: clientIds } },
					{ sourceRegister: companyId }
				],
				deletedAt: null
			},
			include: {
				appointments: {
					where: {
						companyId: companyId,
						deletedAt: null
					},
					select: {
						id: true,
						value: true,
						status: true,
						createdAt: true
					}
				}
			}
		});

		// Remove password dos clientes
		return clients.map(client => {
			const { password, ...clientData } = client;
			return clientData;
		});
	}

	async registerClientAdmin(data: { name: string; email: string; phone: string, sourceRegister: number }) {
		// Check if email is already in use
		const existingClient = await prisma.client.findUnique({
			where: { email: data.email }
		});

		if (existingClient) {
			throw new Error('Email já está em uso');
		}

		// Validate required fields
		if (!data.name) {
			throw new Error('Nome do cliente é obrigatório');
		}

		if (!data.email) {
			throw new Error('Email do cliente é obrigatório');
		}

		if (!data.phone) {
			throw new Error('Telefone do cliente é obrigatório');
		}

		const client = await prisma.client.create({
			data: {
				name: data.name,
				email: data.email,
				phone: data.phone,
				sourceRegister: data.sourceRegister ? data.sourceRegister : null
			}
		});

		// Return client data without password
		const { password, ...clientData } = client;
		return clientData;
	}

	async findClientByPhone(phone: string) {
		return await prisma.client.findFirst({
			where: {
				phone: phone,
				deletedAt: null
			}
		});
	}

	async createClientFromPortal(data: { name: string; email: string; phone: string }) {
		// Verificar se o telefone já está em uso
		const existingClient = await this.findClientByPhone(data.phone);
		if (existingClient) {
			throw new Error('Telefone já está em uso por outro cliente');
		}

		// Validar campos obrigatórios
		if (!data.name) {
			throw new Error('Nome do cliente é obrigatório');
		}

		if (!data.phone) {
			throw new Error('Telefone do cliente é obrigatório');
		}

		const client = await prisma.client.create({
			data: {
				name: data.name,
				email: data.email || '', // Email pode ser opcional
				phone: data.phone
			}
		});

		// Retornar dados do cliente sem a senha
		const { password, ...clientData } = client;
		return clientData;
	}
} 