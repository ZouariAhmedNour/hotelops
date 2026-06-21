import express from 'express';
import cors from 'cors';
import path from 'path';

import { setupSwagger } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import ticketRoutes from './routes/ticketRoutes';
import priorityRoutes from './routes/priorityRoutes';
import locationRoutes from './routes/locationRoutes';
import categoryRoutes from './routes/categoryRoutes';

import maintenanceTeamRoutes from "./routes/maintenanceTeamRoutes";
import maintenanceSkillRoutes from "./routes/maintenanceSkillRoutes";
import agentRoutes from "./routes/agentRoutes";
import agentMobileRoutes from './routes/agentMobileRoutes';
import publicTicketRoutes from './routes/publicTicketRoutes';
import locationQrCodeRoutes from './routes/locationQrCodeRoutes';
import safetyRuleRoutes from './routes/safetyRuleRoutes';
import certificationRoutes from './routes/certificationRoutes';
import assetRoutes from './routes/assetRoutes';

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/locations', locationRoutes);
app.use("/api/assets", assetRoutes);
app.use('/api/priorities',priorityRoutes);
app.use('/api/categories', categoryRoutes);

app.use("/api/maintenance-teams", maintenanceTeamRoutes);
app.use("/api/maintenance-skills", maintenanceSkillRoutes);

app.use("/api/agents", agentRoutes);
app.use("/api/agent", agentMobileRoutes);

app.use("/api/location-qr-codes", locationQrCodeRoutes);
app.use("/api/public", publicTicketRoutes);

app.use("/api/certifications", certificationRoutes);
app.use("/api/safety-rules", safetyRuleRoutes);

// Swagger
setupSwagger(app);

// Error handler (toujours en dernier)
app.use(errorHandler);

export default app;