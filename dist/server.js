"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const UserRoutes_1 = __importDefault(require("./users/UserRoutes"));
const CompanyRoutes_1 = __importDefault(require("./company/CompanyRoutes"));
const PermissionRoutes_1 = __importDefault(require("./permission/PermissionRoutes"));
const AuthRoutes_1 = __importDefault(require("./auth/AuthRoutes"));
const AppointmentRoutes_1 = __importDefault(require("./appointment/AppointmentRoutes"));
const ClientRoutes_1 = __importDefault(require("./client/ClientRoutes"));
const ServiceRoutes_1 = __importDefault(require("./service/ServiceRoutes"));
const ProductRoutes_1 = __importDefault(require("./product/ProductRoutes"));
const ClientAppointmentRoutes_1 = __importDefault(require("./appointment/ClientAppointmentRoutes"));
const CompanySettingsRoutes_1 = __importDefault(require("./company-settings/CompanySettingsRoutes"));
const CommissionRoutes_1 = __importDefault(require("./commission/CommissionRoutes"));
const GoalRoutes_1 = __importDefault(require("./goal/GoalRoutes"));
const RevenueRoutes_1 = __importDefault(require("./revenue/RevenueRoutes"));
const StatisticsRoutes_1 = __importDefault(require("./statistics/StatisticsRoutes"));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)({
    origin: ['http://localhost:8080', 'https://simple-barber-scheduler.lovable.app'], // Domínios permitidos
    credentials: true, // Se precisar de cookies ou autenticação
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
}));
app.use(express_1.default.json());
app.use('/api/user', UserRoutes_1.default);
app.use('/api/permission', PermissionRoutes_1.default);
app.use('/api/auth', AuthRoutes_1.default);
app.use('/api/client/appointment', ClientAppointmentRoutes_1.default);
app.use('/api/client', ClientRoutes_1.default);
app.use('/api/appointment', AppointmentRoutes_1.default);
app.use('/api/service', ServiceRoutes_1.default);
app.use('/api/product', ProductRoutes_1.default);
app.use('/api/company', CompanyRoutes_1.default);
app.use('/api/company-settings', CompanySettingsRoutes_1.default);
app.use('/api/commission', CommissionRoutes_1.default);
app.use('/api/goal', GoalRoutes_1.default);
app.use('/api/revenue', RevenueRoutes_1.default);
app.use('/api/statistics', StatisticsRoutes_1.default);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
