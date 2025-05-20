declare namespace Express {
	export interface Request {
		userId?: number;
		clientId?: number;  // Add clientId for client authentication
	}
} 