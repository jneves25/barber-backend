import prisma from '../config/db/db';
import { AppointmentStatusEnum } from '@prisma/client';

export class ClientAppointmentService {
	async createAppointment(data: {
		clientId: number;
		userId: number;
		companyId: number;
		services: { serviceId: number; quantity: number }[];
		products: { productId: number; quantity: number }[];
		scheduledTime: Date;
	}) {
		// Validate if client exists
		const client = await prisma.client.findUnique({
			where: {
				id: data.clientId,
				deletedAt: null
			}
		});

		if (!client) {
			throw new Error('Cliente não encontrado');
		}

		// Validate if barber exists
		const user = await prisma.user.findUnique({
			where: {
				id: data.userId
			}
		});

		if (!user) {
			throw new Error('Profissional não encontrado');
		}

		// Validate if company exists and get settings
		const company = await prisma.company.findUnique({
			where: {
				id: data.companyId,
				deletedAt: null
			},
			include: {
				settings: true
			}
		});

		if (!company) {
			throw new Error('Empresa não encontrada');
		}

		if (!company.settings) {
			throw new Error('Configurações da empresa não encontradas');
		}

		// Validate appointment time interval
		const scheduledTime = new Date(data.scheduledTime);
		console.log(`Client scheduledTime (UTC):`, scheduledTime.toISOString());

		// Realizar verificações usando o horário UTC diretamente
		const scheduledMinutes = scheduledTime.getUTCHours() * 60 + scheduledTime.getUTCMinutes();

		if (scheduledMinutes % company.settings.appointmentIntervalMinutes !== 0) {
			throw new Error(`O horário do agendamento deve seguir o intervalo de ${company.settings.appointmentIntervalMinutes} minutos definido nas configurações da empresa`);
		}

		// Check for existing appointments at the same time using UTC directly
		const existingAppointment = await prisma.appointment.findFirst({
			where: {
				userId: data.userId,
				companyId: data.companyId,
				scheduledTime: scheduledTime,
				status: {
					not: AppointmentStatusEnum.CANCELED
				}
			}
		});

		if (existingAppointment) {
			throw new Error('Já existe um agendamento para este horário com este profissional');
		}

		// Validate if user belongs to the company
		const companyMember = await prisma.companyMember.findUnique({
			where: {
				companyId_userId: {
					companyId: data.companyId,
					userId: data.userId
				},
				deletedAt: null
			}
		});

		if (!companyMember) {
			throw new Error('Profissional não pertence a esta empresa');
		}

		// Validate if all services belong to the company
		let servicesData = [];
		let totalServiceValue = 0;
		if (data.services && data.services.length > 0) {
			const serviceIds = data.services.map(service => service.serviceId);
			const validServices = await prisma.service.findMany({
				where: {
					id: { in: serviceIds },
					companyId: data.companyId,
					deletedAt: null
				}
			});

			if (validServices.length !== serviceIds.length) {
				throw new Error('Um ou mais serviços não pertencem a esta empresa');
			}

			// Calculate total service value and store services data
			servicesData = validServices.map(service => {
				const requestedService = data.services.find(s => s.serviceId === service.id);
				const quantity = requestedService ? requestedService.quantity : 1;
				totalServiceValue += service.price * quantity;
				return {
					service,
					quantity
				};
			});
		}

		// Validate if all products belong to the company
		let productsData = [];
		let totalProductValue = 0;
		if (data.products && data.products.length > 0) {
			const productIds = data.products.map(product => product.productId);
			const validProducts = await prisma.product.findMany({
				where: {
					id: { in: productIds },
					companyId: data.companyId,
					deletedAt: null
				}
			});

			if (validProducts.length !== productIds.length) {
				throw new Error('Um ou mais produtos não pertencem a esta empresa');
			}

			// Calculate total product value and store products data
			productsData = validProducts.map(product => {
				const requestedProduct = data.products.find(p => p.productId === product.id);
				const quantity = requestedProduct ? requestedProduct.quantity : 1;
				totalProductValue += product.price * quantity;
				return {
					product,
					quantity
				};
			});
		}

		// Calculate total value
		const totalValue = totalServiceValue + totalProductValue;

		// Create appointment with services and products
		return await prisma.$transaction(async (prismaClient) => {
			// Create appointment with scheduled time in UTC directly
			const appointment = await prismaClient.appointment.create({
				data: {
					clientId: data.clientId,
					userId: data.userId,
					companyId: data.companyId,
					value: totalValue,
					status: AppointmentStatusEnum.PENDING,
					scheduledTime: scheduledTime // Salvar como UTC diretamente
				},
				include: {
					client: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true
						}
					},
					company: true
				}
			});

			// Create service appointments
			const serviceAppointments: { appointmentId: number; serviceId: number; service: any; quantity: number; id: number }[] = [];
			if (data.services && data.services.length > 0) {
				await Promise.all(
					data.services.map(async service => {
						const serviceAppointment = await prismaClient.serviceAppointment.create({
							data: {
								appointmentId: appointment.id,
								serviceId: service.serviceId,
								quantity: service.quantity
							},
							include: {
								service: true
							}
						});
						serviceAppointments.push(serviceAppointment);
					})
				);
			}

			// Create product appointments
			const productAppointments: { appointmentId: number; productId: number; product: any; quantity: number; id: number }[] = [];
			if (data.products && data.products.length > 0) {
				await Promise.all(
					data.products.map(async product => {
						const productAppointment = await prismaClient.productAppointment.create({
							data: {
								appointmentId: appointment.id,
								productId: product.productId,
								quantity: product.quantity
							},
							include: {
								product: true
							}
						});
						productAppointments.push(productAppointment);
					})
				);
			}

			// Return appointment with all related data
			return {
				...appointment,
				services: serviceAppointments,
				products: productAppointments,
			};
		});
	}

	async getClientAppointmentById(appointmentId: number, clientId: number) {
		return await prisma.appointment.findFirst({
			where: {
				id: appointmentId,
				clientId,
				deletedAt: null
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true
					}
				},
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
		});
	}

	async getClientAppointments(clientId: number) {
		return await prisma.appointment.findMany({
			where: { clientId, deletedAt: null },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true
					}
				},
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
			},
			orderBy: {
				createdAt: 'desc'
			}
		});
	}

	async updateAppointmentStatus(appointmentId: number, status: AppointmentStatusEnum) {
		return await prisma.appointment.update({
			where: { id: appointmentId, deletedAt: null },
			data: { status }
		});
	}

	async deleteAppointment(appointmentId: number) {
		// First delete related service and product appointments
		await prisma.serviceAppointment.deleteMany({
			where: { appointmentId, deletedAt: null }
		});

		await prisma.productAppointment.deleteMany({
			where: { appointmentId, deletedAt: null }
		});

		// Then delete the appointment
		return await prisma.appointment.update({
			where: { id: appointmentId, deletedAt: null },
			data: {
				deletedAt: new Date()
			}
		});
	}
} 