"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientAppointmentService = void 0;
const db_1 = __importDefault(require("../config/db/db"));
const client_1 = require("@prisma/client");
class ClientAppointmentService {
    createAppointment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate if client exists
            const client = yield db_1.default.client.findUnique({
                where: {
                    id: data.clientId,
                    deletedAt: null
                }
            });
            if (!client) {
                throw new Error('Cliente não encontrado');
            }
            // Validate if barber exists
            const user = yield db_1.default.user.findUnique({
                where: {
                    id: data.userId
                }
            });
            if (!user) {
                throw new Error('Profissional não encontrado');
            }
            // Validate if company exists and get settings
            const company = yield db_1.default.company.findUnique({
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
            const existingAppointment = yield db_1.default.appointment.findFirst({
                where: {
                    userId: data.userId,
                    companyId: data.companyId,
                    scheduledTime: scheduledTime,
                    status: {
                        not: client_1.AppointmentStatusEnum.CANCELED
                    }
                }
            });
            if (existingAppointment) {
                throw new Error('Já existe um agendamento para este horário com este profissional');
            }
            // Validate if user belongs to the company
            const companyMember = yield db_1.default.companyMember.findUnique({
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
                const validServices = yield db_1.default.service.findMany({
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
                const validProducts = yield db_1.default.product.findMany({
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
            return yield db_1.default.$transaction((prismaClient) => __awaiter(this, void 0, void 0, function* () {
                // Create appointment with scheduled time in UTC directly
                const appointment = yield prismaClient.appointment.create({
                    data: {
                        clientId: data.clientId,
                        userId: data.userId,
                        companyId: data.companyId,
                        value: totalValue,
                        status: client_1.AppointmentStatusEnum.PENDING,
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
                const serviceAppointments = [];
                if (data.services && data.services.length > 0) {
                    yield Promise.all(data.services.map((service) => __awaiter(this, void 0, void 0, function* () {
                        const serviceAppointment = yield prismaClient.serviceAppointment.create({
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
                    })));
                }
                // Create product appointments
                const productAppointments = [];
                if (data.products && data.products.length > 0) {
                    yield Promise.all(data.products.map((product) => __awaiter(this, void 0, void 0, function* () {
                        const productAppointment = yield prismaClient.productAppointment.create({
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
                    })));
                }
                // Return appointment with all related data
                return Object.assign(Object.assign({}, appointment), { services: serviceAppointments, products: productAppointments });
            }));
        });
    }
    getClientAppointmentById(appointmentId, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.appointment.findFirst({
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
        });
    }
    getClientAppointments(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.appointment.findMany({
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
        });
    }
    updateAppointmentStatus(appointmentId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.appointment.update({
                where: { id: appointmentId, deletedAt: null },
                data: { status }
            });
        });
    }
    deleteAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            // First delete related service and product appointments
            yield db_1.default.serviceAppointment.deleteMany({
                where: { appointmentId, deletedAt: null }
            });
            yield db_1.default.productAppointment.deleteMany({
                where: { appointmentId, deletedAt: null }
            });
            // Then delete the appointment
            return yield db_1.default.appointment.update({
                where: { id: appointmentId, deletedAt: null },
                data: {
                    deletedAt: new Date()
                }
            });
        });
    }
}
exports.ClientAppointmentService = ClientAppointmentService;
