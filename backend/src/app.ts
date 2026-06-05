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

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Swagger
setupSwagger(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/priorities',priorityRoutes);
app.use('/api/categories', categoryRoutes);

app.use("/api/maintenance-teams", maintenanceTeamRoutes);
app.use("/api/maintenance-skills", maintenanceSkillRoutes);
app.use("/api/agents", agentRoutes);

// Error handler (toujours en dernier)
app.use(errorHandler);

export default app;