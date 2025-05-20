import express from 'express';
import cors from 'cors';
import userRoutes from './users/UserRoutes';
import CompanyRoutes from './company/CompanyRoutes';
import permissionRoutes from './permission/PermissionRoutes';
import authRoutes from './auth/AuthRoutes';
import appointmentRoutes from './appointment/AppointmentRoutes';
import clientRoutes from './client/ClientRoutes';
import serviceRoutes from './service/ServiceRoutes';
import productRoutes from './product/ProductRoutes';
import clientAppointmentRoutes from './appointment/ClientAppointmentRoutes';
import companySettingsRoutes from './company-settings/CompanySettingsRoutes';
import commissionRoutes from './commission/CommissionRoutes';
import goalRoutes from './goal/GoalRoutes';
import revenueRoutes from './revenue/RevenueRoutes';
import statisticsRoutes from './statistics/StatisticsRoutes';

const app = express();
const port = 3000;

app.use(cors({
	origin: ['http://localhost:8080', 'https://simple-barber-scheduler.lovable.app'],  // Domínios permitidos
	credentials: true,  // Se precisar de cookies ou autenticação
	methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Métodos permitidos
	allowedHeaders: ['Content-Type', 'Authorization'],  // Cabeçalhos permitidos
}));

app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/permission', permissionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/client/appointment', clientAppointmentRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/product', productRoutes);
app.use('/api/company', CompanyRoutes);
app.use('/api/company-settings', companySettingsRoutes);
app.use('/api/commission', commissionRoutes);
app.use('/api/goal', goalRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/statistics', statisticsRoutes);

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
