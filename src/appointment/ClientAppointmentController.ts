import { Request, Response } from 'express';
import { ClientAppointmentService } from './ClientAppointmentService';
import { AppointmentStatusEnum } from '@prisma/client';
import { ClientService } from '../client/ClientService';

const clientAppointmentService = new ClientAppointmentService();
const clientService = new ClientService();

export class ClientAppointmentController {
	static async createAppointment(req: Request, res: Response): Promise<void> {
		const { companyId, userId, services, products, scheduledTime, customerPhone, customerName, customerEmail } = req.body;

		try {
			if (!customerPhone) {
				res.status(422).json({ message: 'Telefone do cliente é obrigatório' });
				return;
			}

			if (!companyId) {
				res.status(422).json({ message: 'Empresa é obrigatório' });
				return;
			}

			if (!userId) {
				res.status(422).json({ message: 'Profissional é obrigatório' });
				return;
			}

			// Parse scheduledTime to ensure it's a valid date, mas manter no UTC
			let parsedScheduledTime;
			try {
				parsedScheduledTime = new Date(scheduledTime);
				// Check if it's a valid date
				if (isNaN(parsedScheduledTime.getTime())) {
					throw new Error("Data inválida");
				}
				console.log("ClientController - Parsed scheduledTime (UTC):", parsedScheduledTime.toISOString());
			} catch (error) {
				res.status(422).json({ message: 'Formato de data e hora inválido' });
				return;
			}

			// Verificar se o cliente já existe pelo telefone
			let clientId: number;
			const existingClient = await clientService.findClientByPhone(customerPhone);

			if (existingClient) {
				clientId = existingClient.id;
			} else if (customerName) {
				// Se o cliente não existe, criar um novo cliente
				const newClient = await clientService.createClientFromPortal({
					name: customerName,
					phone: customerPhone,
					email: customerEmail || ''
				});

				clientId = newClient.id;
			} else {
				res.status(422).json({ message: 'Nome do cliente é obrigatório para novos clientes' });
				return;
			}

			const newAppointment = await clientAppointmentService.createAppointment({
				clientId,
				userId,
				companyId,
				services,
				products,
				scheduledTime: parsedScheduledTime
			});

			res.status(201).json(newAppointment);
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro inesperado ao criar agendamento', error });
			}
		}
	}

	static async getClientAppointments(req: Request, res: Response): Promise<void> {
		const clientId = req.clientId;

		try {
			if (!clientId) {
				res.status(404).json({ message: 'Ocorreu um erro com o cliente, por favor tente novamente mais tarde!' });
				return;
			}

			const appointments = await clientAppointmentService.getClientAppointments(clientId);
			res.status(200).json(appointments);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar agendamentos', error });
		}
	}

	static async getAppointmentById(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const clientId = req.clientId;

		try {
			if (!clientId) {
				res.status(404).json({ message: 'Ocorreu um erro com o cliente, por favor tente novamente mais tarde!' });
				return;
			}

			const appointment = await clientAppointmentService.getClientAppointmentById(Number(id), clientId);

			if (!appointment) {
				res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a este cliente' });
				return;
			}

			res.status(200).json(appointment);
		} catch (error) {
			res.status(500).json({ message: 'Erro ao buscar agendamento', error });
		}
	}

	static async cancelAppointment(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const clientId = req.clientId;

		try {
			if (!clientId) {
				res.status(404).json({ message: 'Ocorreu um erro com o cliente, por favor tente novamente mais tarde!' });
				return;
			}

			const appointment = await clientAppointmentService.getClientAppointmentById(Number(id), clientId);

			if (!appointment) {
				res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a este cliente' });
				return;
			}

			const updatedAppointment = await clientAppointmentService.updateAppointmentStatus(Number(id), AppointmentStatusEnum.CANCELED);
			res.status(200).json(updatedAppointment);
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro ao cancelar agendamento', error });
			}
		}
	}

	static async deleteAppointment(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const clientId = req.clientId;

		try {
			if (!clientId) {
				res.status(404).json({ message: 'Ocorreu um erro com o cliente, por favor tente novamente mais tarde!' });
				return;
			}

			const appointment = await clientAppointmentService.getClientAppointmentById(Number(id), clientId);

			if (!appointment) {
				res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a este cliente' });
				return;
			}

			// Only allow deletion of pending appointments
			if (appointment.status !== AppointmentStatusEnum.PENDING) {
				res.status(400).json({ message: 'Apenas agendamentos pendentes podem ser excluídos' });
				return;
			}

			await clientAppointmentService.deleteAppointment(Number(id));
			res.status(204).send();
		} catch (error) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(500).json({ message: 'Erro ao excluir agendamento', error });
			}
		}
	}
} 