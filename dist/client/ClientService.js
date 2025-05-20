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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientService = void 0;
const db_1 = __importDefault(require("../config/db/db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const JWT_EXPIRES_IN = '7d';
class ClientService {
    static generateToken(clientId) {
        const payload = { clientId };
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
    static verifyPassword(storedPassword, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcryptjs_1.default.compare(password, storedPassword);
        });
    }
    registerClient(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if email is already in use
            const existingClient = yield db_1.default.client.findUnique({
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
            const hashedPassword = yield bcryptjs_1.default.hash(data.password, 10);
            const client = yield db_1.default.client.create({
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
            const { password } = client, clientData = __rest(client, ["password"]);
            return { token, client: clientData };
        });
    }
    loginClient(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.client.findUnique({
                where: { email, deletedAt: null }
            });
            if (!client) {
                throw new Error('Cliente não encontrado');
            }
            if (!client.password) {
                throw new Error('Primeiro acesso do cliente, por favor tente trocar a senha!');
            }
            const isPasswordValid = yield ClientService.verifyPassword(client.password, password);
            if (!isPasswordValid) {
                throw new Error('Senha incorreta');
            }
            const token = ClientService.generateToken(client.id);
            // Return client data without password
            const { password: _ } = client, clientData = __rest(client, ["password"]);
            return { token, client: clientData };
        });
    }
    createClient(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if email is already in use
            const existingClient = yield db_1.default.client.findUnique({
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
            const hashedPassword = yield bcryptjs_1.default.hash(data.password, 10);
            const client = yield db_1.default.client.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    password: hashedPassword
                }
            });
            // Return client data without password
            const { password } = client, clientData = __rest(client, ["password"]);
            return clientData;
        });
    }
    getAllClients() {
        return __awaiter(this, void 0, void 0, function* () {
            const clients = yield db_1.default.client.findMany({
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
                const { password } = client, clientData = __rest(client, ["password"]);
                return clientData;
            });
        });
    }
    getClientById(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.client.findUnique({
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
            if (!client)
                return null;
            // Remove password from client data
            const { password } = client, clientData = __rest(client, ["password"]);
            return clientData;
        });
    }
    getClientsByBarber(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get clients that have appointments with this barber
            const appointments = yield db_1.default.appointment.findMany({
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
            const clients = yield db_1.default.client.findMany({
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
                const { password } = client, clientData = __rest(client, ["password"]);
                return clientData;
            });
        });
    }
    updateClient(clientId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientToUpdate = yield db_1.default.client.findUnique({
                where: { id: clientId, deletedAt: null }
            });
            if (!clientToUpdate) {
                throw new Error('Cliente não encontrado');
            }
            // If email is being updated, check if it's already in use
            if (data.email && data.email !== clientToUpdate.email) {
                const existingClient = yield db_1.default.client.findUnique({
                    where: { email: data.email, deletedAt: null }
                });
                if (existingClient) {
                    throw new Error('Email já está em uso por outro cliente');
                }
            }
            // Prepare the data to update
            const updateData = {
                name: data.name || clientToUpdate.name,
                email: data.email || clientToUpdate.email,
                phone: data.phone || clientToUpdate.phone
            };
            // If password is being updated, hash it
            if (data.password) {
                updateData.password = yield bcryptjs_1.default.hash(data.password, 10);
            }
            const updatedClient = yield db_1.default.client.update({
                where: { id: clientId, deletedAt: null },
                data: updateData
            });
            // Remove password from client data
            const { password } = updatedClient, clientData = __rest(updatedClient, ["password"]);
            return clientData;
        });
    }
    deleteClient(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield db_1.default.client.findUnique({
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
            const deletedClient = yield db_1.default.client.update({
                where: { id: clientId, deletedAt: null },
                data: {
                    deletedAt: new Date()
                }
            });
            // Remove password from client data
            const { password } = deletedClient, clientData = __rest(deletedClient, ["password"]);
            return clientData;
        });
    }
    getAllClientsByCompany(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointments = yield db_1.default.appointment.findMany({
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
            const clients = yield db_1.default.client.findMany({
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
                const { password } = client, clientData = __rest(client, ["password"]);
                return clientData;
            });
        });
    }
    registerClientAdmin(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if email is already in use
            const existingClient = yield db_1.default.client.findUnique({
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
            const client = yield db_1.default.client.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    sourceRegister: data.sourceRegister ? data.sourceRegister : null
                }
            });
            // Return client data without password
            const { password } = client, clientData = __rest(client, ["password"]);
            return clientData;
        });
    }
    findClientByPhone(phone) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.client.findFirst({
                where: {
                    phone: phone,
                    deletedAt: null
                }
            });
        });
    }
    createClientFromPortal(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar se o telefone já está em uso
            const existingClient = yield this.findClientByPhone(data.phone);
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
            const client = yield db_1.default.client.create({
                data: {
                    name: data.name,
                    email: data.email || '', // Email pode ser opcional
                    phone: data.phone
                }
            });
            // Retornar dados do cliente sem a senha
            const { password } = client, clientData = __rest(client, ["password"]);
            return clientData;
        });
    }
}
exports.ClientService = ClientService;
