import { Request, Response } from 'express';
import { ClientService } from './ClientService';
import { AppointmentService } from '../appointment/AppointmentService';

const clientService = new ClientService();
const appointmentService = new AppointmentService();

export class ClientController {

	// personal section \/

	static async registerClient(req: Request, res: Response): Promise<void> {
		const { name, email, phone, password } = req.body;

		try {
			const result = await clientService.registerClient({ name, email, phone, password });

			res.status(201).json(result);
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro inesperado ao registrar cliente', error });
			}
		}
	}

	static async loginClient(req: Request, res: Response): Promise<void> {
		const { email, password } = req.body;

		try {
			const result = await clientService.loginClient(email, password);
			res.status(200).json(result);
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro inesperado ao fazer login', error });
			}
		}
	}

	static async getClientInformation(req: Request, res: Response): Promise<void> {
		const clientId = req.clientId;

		try {
			if (!clientId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const client = await clientService.getClientById(clientId);

			if (!client) {
				res.status(404).json({ message: 'Cliente não encontrado' });
				return;
			}

			res.status(200).json(client);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar cliente', error });
		}
	}

	static async updateClient(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const { name, email, phone, password } = req.body;
		const clientId = req.clientId;

		try {
			if (!clientId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			if (parseInt(id) !== clientId) {
				res.status(404).json({ message: 'Você não pode alterar o cadastro de outro usuário sem permissões!' });
				return;
			}

			const updatedClient = await clientService.updateClient(Number(id), { name, email, phone, password });

			res.status(200).json(updatedClient);
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro ao atualizar cliente', error });
			}
		}
	}

	static async deleteClient(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const clientId = req.clientId;

		try {
			if (!clientId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			if (parseInt(id) !== clientId) {
				res.status(404).json({ message: 'Você não pode deletar o cadastro de outro usuário sem permissões!' });
				return;
			}

			await clientService.deleteClient(Number(id));

			res.status(204).send();
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro ao excluir cliente', error });
			}
		}
	}



	// admin section \/

	static async registerClientAdmin(req: Request, res: Response): Promise<void> {
		const { companyId } = req.query
		const { name, email, phone } = req.body;

		try {
			if (!companyId) {
				res.status(422).json({ message: 'É preciso enviar uma empresa ao cadastrar um cliente manualmente' });
				return;
			}

			const result = await clientService.registerClientAdmin({ name, email, phone, sourceRegister: Number(companyId) });

			res.status(201).json(result);
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro inesperado ao registrar cliente', error });
			}
		}
	}

	static async getClientById(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const client = await clientService.getClientById(Number(id));

			if (!client) {
				res.status(404).json({ message: 'Cliente não encontrado' });
				return;
			}

			res.status(200).json(client);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar cliente', error });
		}
	}

	static async getClientsByBarber(req: Request, res: Response): Promise<void> {
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			const clients = await clientService.getClientsByBarber(userId);
			res.status(200).json(clients);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar clientes do barbeiro', error });
		}
	}


	static async getAllClientsByCompany(req: Request, res: Response): Promise<void> {
		const { companyId } = req.query
		const userId = req.userId;

		try {
			if (!userId) {
				res.status(404).json({ message: 'Ocorreu um erro com o usuário, por favor tente novamente mais tarde!' });
				return;
			}

			if (!companyId) {
				res.status(404).json({ message: 'Empresa não encontrada para este usuário' });
				return;
			}

			const clients = await clientService.getAllClientsByCompany(Number(companyId));

			res.status(200).json(clients);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar clientes', error });
		}
	}

} 