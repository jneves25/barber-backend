import prisma from '../config/db/db';
import { AppointmentStatusEnum } from '@prisma/client';

export class AppointmentService {
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
			where: { id: data.clientId, deletedAt: null }
		});

		if (!client) {
			throw new Error('Cliente não encontrado');
		}

		// Validate if barber exists
		const user = await prisma.user.findUnique({
			where: { id: data.userId, deletedAt: null }
		});

		if (!user) {
			throw new Error('Profissional não encontrado');
		}

		// Validate if company exists and get settings
		const company = await prisma.company.findUnique({
			where: { id: data.companyId, deletedAt: null },
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
		const scheduledMinutes = scheduledTime.getHours() * 60 + scheduledTime.getMinutes();

		if (scheduledMinutes % company.settings.appointmentIntervalMinutes !== 0) {
			throw new Error(`O horário do agendamento deve seguir o intervalo de ${company.settings.appointmentIntervalMinutes} minutos definido nas configurações da empresa`);
		}

		// Check for existing appointments at the same time
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
				}
			}
		});

		if (!companyMember) {
			throw new Error('Profissional não pertence a esta empresa');
		}

		// Validate if all services belong to the company
		let servicesData: { service: any; quantity: number }[] = [];
		let totalServiceValue = 0;
		if (data.services && data.services.length > 0) {
			const serviceIds = data.services.map(service => service.serviceId);
			const validServices = await prisma.service.findMany({
				where: {
					id: { in: serviceIds },
					companyId: data.companyId
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
		let productsData: { product: any; quantity: number }[] = [];
		let totalProductValue = 0;
		if (data.products && data.products.length > 0) {
			const productIds = data.products.map(product => product.productId);
			const validProducts = await prisma.product.findMany({
				where: {
					id: { in: productIds },
					companyId: data.companyId
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

		// Calculate total duration of all services
		let totalDurationMinutes = 0;
		if (data.services && data.services.length > 0) {
			// Calculate the sum of durations for each service * quantity
			servicesData.forEach(serviceData => {
				const service = serviceData.service;
				const quantity = serviceData.quantity;
				totalDurationMinutes += service.duration * quantity;
			});
		}

		console.log(`Total duration of services: ${totalDurationMinutes} minutes`);
		console.log(`Scheduled time type:`, typeof data.scheduledTime);
		console.log(`Scheduled time value:`, data.scheduledTime);

		// Usar diretamente a data recebida sem ajustes de fuso horário
		// A data já deve vir como UTC do frontend
		let scheduledTimeUTC: Date;
		if (typeof data.scheduledTime === 'string') {
			scheduledTimeUTC = new Date(data.scheduledTime);
		} else if (data.scheduledTime instanceof Date) {
			scheduledTimeUTC = data.scheduledTime;
		} else {
			// Se não for string nem Date, tentar converter para Date
			try {
				scheduledTimeUTC = new Date(data.scheduledTime);
			} catch (error) {
				throw new Error('O formato da data e hora agendada é inválido');
			}
		}

		console.log(`Scheduled time UTC:`, scheduledTimeUTC.toISOString());

		// Calculate the end datetime usando UTC diretamente
		const endScheduledTimeUTC = new Date(scheduledTimeUTC);
		endScheduledTimeUTC.setMinutes(endScheduledTimeUTC.getMinutes() + totalDurationMinutes);

		console.log(`Start time (UTC):`, scheduledTimeUTC.toISOString());
		console.log(`End time (UTC):`, endScheduledTimeUTC.toISOString());

		// Create appointment with services and products
		return await prisma.$transaction(async (prismaClient) => {
			// Create appointment with calculated endScheduledTime
			const appointmentData: any = {
				clientId: data.clientId,
				userId: data.userId,
				companyId: data.companyId,
				value: totalValue,
				status: AppointmentStatusEnum.PENDING,
				scheduledTime: scheduledTimeUTC
			};

			// Add endScheduledTime if we have services with durations
			if (totalDurationMinutes > 0) {
				appointmentData.endScheduledTime = endScheduledTimeUTC;
			}

			const appointment = await prismaClient.appointment.create({
				data: appointmentData,
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

	async getAppointmentById(appointmentId: number) {
		return await prisma.appointment.findUnique({
			where: { id: appointmentId },
			include: {
				client: true,
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

	async getAllAppointments(companyId: number) {
		return await prisma.appointment.findMany({
			where: { companyId },
			include: {
				client: true,
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

	async getAppointmentsByBarber(userId: number, companyId: number, date?: string) {
		let whereClause: any = {
			userId,
			companyId,
			deletedAt: null
		};

		// Se uma data foi informada, adiciona o filtro por data
		if (date) {
			// Parse da data para obter UTC start/end
			const dateParts = date.split('-').map(Number);
			const year = dateParts[0];
			const month = dateParts[1] - 1;
			const day = dateParts[2];

			const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
			const endDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

			whereClause.scheduledTime = {
				gte: startDate,
				lte: endDate
			};
		}

		return await prisma.appointment.findMany({
			where: whereClause,
			include: {
				client: true,
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
				scheduledTime: 'asc'
			}
		});
	}

	async updateAppointmentStatus(appointmentId: number, status: AppointmentStatusEnum) {
		return await prisma.appointment.update({
			where: { id: appointmentId },
			data: { status },
			include: {
				client: true,
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

	async deleteAppointment(appointmentId: number) {
		// First delete related service and product appointments
		await prisma.serviceAppointment.deleteMany({
			where: { appointmentId }
		});

		await prisma.productAppointment.deleteMany({
			where: { appointmentId }
		});

		// Then delete the appointment
		return await prisma.appointment.update({
			where: { id: appointmentId, deletedAt: null },
			data: {
				deletedAt: new Date()
			}
		});
	}

	async updateAppointment(appointmentId: number, data: {
		services: { serviceId: number; quantity: number }[];
		products: { productId: number; quantity: number }[];
	}) {
		// Get the existing appointment
		const existingAppointment = await prisma.appointment.findUnique({
			where: { id: appointmentId },
			include: {
				services: true,
				products: true,
				company: true
			}
		});

		if (!existingAppointment) {
			throw new Error('Agendamento não encontrado');
		}

		// Validate if all services belong to the company
		let servicesData: { service: any; quantity: number }[] = [];
		let totalServiceValue = 0;
		if (data.services && data.services.length > 0) {
			const serviceIds = data.services.map(service => service.serviceId);
			const validServices = await prisma.service.findMany({
				where: {
					id: { in: serviceIds },
					companyId: existingAppointment.companyId
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
		let productsData: { product: any; quantity: number }[] = [];
		let totalProductValue = 0;
		if (data.products && data.products.length > 0) {
			const productIds = data.products.map(product => product.productId);
			const validProducts = await prisma.product.findMany({
				where: {
					id: { in: productIds },
					companyId: existingAppointment.companyId
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

		// Update appointment with services and products
		return await prisma.$transaction(async (prismaClient) => {
			// Delete existing service appointments
			await prismaClient.serviceAppointment.deleteMany({
				where: { appointmentId }
			});

			// Delete existing product appointments
			await prismaClient.productAppointment.deleteMany({
				where: { appointmentId }
			});

			// Update appointment value
			const appointment = await prismaClient.appointment.update({
				where: { id: appointmentId },
				data: {
					value: totalValue
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

			// Create new service appointments
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

			// Create new product appointments
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

	async getAvailableTimeSlots(userId: number, companyId: number, date: string) {
		// Validate if barber exists
		const user = await prisma.user.findUnique({
			where: { id: userId, deletedAt: null }
		});

		if (!user) {
			throw new Error('Profissional não encontrado');
		}

		// Validate if company exists and get settings
		const company = await prisma.company.findUnique({
			where: { id: companyId, deletedAt: null },
			include: {
				settings: {
					include: {
						workingHours: true
					}
				}
			}
		});

		if (!company) {
			throw new Error('Empresa não encontrada');
		}

		if (!company.settings) {
			throw new Error('Configurações da empresa não encontradas');
		}

		// Parse the date to get start and end of day in UTC
		const dateParts = date.split('-').map(Number);
		const year = dateParts[0];
		const month = dateParts[1] - 1;
		const day = dateParts[2];

		// Create dates at beginning and end of the requested day in local timezone
		const startDate = new Date(year, month, day, 0, 0, 0);
		const endDate = new Date(year, month, day, 23, 59, 59, 999);

		// Validate if the requested date is not in the past
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
		const requestDate = new Date(year, month, day);
		requestDate.setHours(0, 0, 0, 0);

		if (requestDate < currentDate) {
			return [];
		}

		// Get company's business hours for specific day of the week
		if (!company.settings.workingHours) {
			throw new Error('Horário de funcionamento da empresa não configurado');
		}

		// Determine which day of the week property to use
		const dayOfWeek = startDate.getDay(); // 0 is Sunday, 1 is Monday, etc.

		let openingTime: string;
		let closingTime: string;

		switch (dayOfWeek) {
			case 0: // Sunday
				openingTime = company.settings.workingHours.sundayOpen;
				closingTime = company.settings.workingHours.sundayClose;
				break;
			case 1: // Monday
				openingTime = company.settings.workingHours.mondayOpen;
				closingTime = company.settings.workingHours.mondayClose;
				break;
			case 2: // Tuesday
				openingTime = company.settings.workingHours.tuesdayOpen;
				closingTime = company.settings.workingHours.tuesdayClose;
				break;
			case 3: // Wednesday
				openingTime = company.settings.workingHours.wednesdayOpen;
				closingTime = company.settings.workingHours.wednesdayClose;
				break;
			case 4: // Thursday
				openingTime = company.settings.workingHours.thursdayOpen;
				closingTime = company.settings.workingHours.thursdayClose;
				break;
			case 5: // Friday
				openingTime = company.settings.workingHours.fridayOpen;
				closingTime = company.settings.workingHours.fridayClose;
				break;
			case 6: // Saturday
				openingTime = company.settings.workingHours.saturdayOpen;
				closingTime = company.settings.workingHours.saturdayClose;
				break;
			default:
				throw new Error('Dia da semana inválido');
		}

		if (!openingTime || !closingTime) {
			throw new Error(`A empresa não funciona no dia ${startDate.toLocaleDateString()}`);
		}

		// Parse opening and closing hours
		const [openHour, openMinute] = openingTime.split(':').map(Number);
		const [closeHour, closeMinute] = closingTime.split(':').map(Number);

		const openingMinutes = openHour * 60 + openMinute;
		const closingMinutes = closeHour * 60 + closeMinute;

		// Get appointment interval from company settings
		const intervalMinutes = company.settings.appointmentIntervalMinutes || 30;

		// Get all time slots based on company settings
		const allTimeSlots = [];
		for (let minutes = openingMinutes; minutes < closingMinutes; minutes += intervalMinutes) {
			const hours = Math.floor(minutes / 60);
			const mins = minutes % 60;

			const timeSlot = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
			allTimeSlots.push(timeSlot);
		}

		// Get all existing appointments for this day and professional
		const existingAppointments = await prisma.appointment.findMany({
			where: {
				userId: userId,
				companyId: companyId,
				scheduledTime: {
					gte: startDate,
					lte: endDate
				},
				status: {
					not: AppointmentStatusEnum.CANCELED
				}
			},
			select: {
				id: true,
				scheduledTime: true,
				endScheduledTime: true,
				services: {
					include: {
						service: {
							select: {
								duration: true
							}
						}
					}
				}
			}
		});

		console.log(`Found ${existingAppointments.length} existing appointments for user ${userId} on ${date}`);
		console.log(`Appointments:`, existingAppointments.map(a => ({
			id: a.id,
			start: a.scheduledTime ? new Date(a.scheduledTime).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : null,
			end: a.endScheduledTime ? new Date(a.endScheduledTime).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : null,
			services: a.services
		})));

		// Melhoria na detecção de horários ocupados
		const bookedTimeSlots = new Set<string>();

		existingAppointments
			.filter(appointment => appointment.scheduledTime !== null)
			.forEach(appointment => {
				if (appointment.scheduledTime) {
					// Converter para o timezone local (Brasil)
					const startTime = new Date(appointment.scheduledTime);
					const startTimeBR = new Date(startTime.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
					const startHours = startTimeBR.getHours();
					const startMinutes = startTimeBR.getMinutes();

					// Formato padronizado para o horário de início
					const startTimeSlot = `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
					bookedTimeSlots.add(startTimeSlot);

					// Calcular a duração do agendamento
					let durationMinutes = 0;

					// Se tiver serviços, calcular a duração total dos serviços
					if (appointment.services && appointment.services.length > 0) {
						durationMinutes = appointment.services.reduce((total, serviceAppointment) => {
							return total + (serviceAppointment.service.duration * serviceAppointment.quantity);
						}, 0);
					}

					// Se não tiver duração calculada, usar o intervalo padrão
					if (durationMinutes === 0) {
						durationMinutes = company.settings?.appointmentIntervalMinutes || 30;
					}

					// Se tiver endScheduledTime, usar ele para calcular a duração
					if (appointment.endScheduledTime) {
						const endTime = new Date(appointment.endScheduledTime);
						const endTimeBR = new Date(endTime.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
						const endHours = endTimeBR.getHours();
						const endMinutes = endTimeBR.getMinutes();

						const startTotalMinutes = startHours * 60 + startMinutes;
						const endTotalMinutes = endHours * 60 + endMinutes;
						durationMinutes = endTotalMinutes - startTotalMinutes;
					}

					// Bloquear todos os horários que fazem parte deste agendamento
					const startTotalMinutes = startHours * 60 + startMinutes;
					for (let minutes = startTotalMinutes; minutes < startTotalMinutes + durationMinutes; minutes += intervalMinutes) {
						const hours = Math.floor(minutes / 60);
						const mins = minutes % 60;
						const timeSlot = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
						bookedTimeSlots.add(timeSlot);
					}
				}
			});

		// Usar Array.from para converter o Set para array antes de filtrar
		const bookedTimeSlotsArray = Array.from(bookedTimeSlots);
		console.log(`Booked time slots: ${bookedTimeSlotsArray.length}`, bookedTimeSlotsArray);

		// Filtrar os horários disponíveis
		let availableTimeSlots = allTimeSlots.filter(timeSlot => !bookedTimeSlotsArray.includes(timeSlot));

		// Check if the requested date is today
		const today = new Date();
		const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

		// If the requested date is today, filter out time slots that are earlier than current time
		if (isToday) {
			const currentHour = today.getHours();
			const currentMinute = today.getMinutes();
			const currentTimeInMinutes = currentHour * 60 + currentMinute;

			availableTimeSlots = availableTimeSlots.filter(timeSlot => {
				const [hour, minute] = timeSlot.split(':').map(Number);
				const slotTimeInMinutes = hour * 60 + minute;

				// Only include time slots that are in the future
				return slotTimeInMinutes > currentTimeInMinutes;
			});

			console.log(`Filtered time slots based on current time (${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')})`, availableTimeSlots);
		}

		console.log(`Available time slots: ${availableTimeSlots.length}`, availableTimeSlots);

		return availableTimeSlots;
	}

	async getAppointmentsByDate(companyId: number, date: string) {
		// Parse da data para obter UTC start/end
		const dateParts = date.split('-').map(Number);
		const year = dateParts[0];
		const month = dateParts[1] - 1;
		const day = dateParts[2];

		const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
		const endDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

		return await prisma.appointment.findMany({
			where: {
				companyId,
				scheduledTime: {
					gte: startDate,
					lte: endDate
				},
				deletedAt: null
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
				scheduledTime: 'asc'
			}
		});
	}
} 