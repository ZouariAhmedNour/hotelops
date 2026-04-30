import express from 'express';
import cors from 'cors';
import path from 'path';

import { setupSwagger } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import roleRoutes from './routes/roleRoutes';
import locationRoutes from './routes/locationRoutes';
import categoryRoutes from './routes/categoryRoutes';
import priorityRoutes from './routes/priorityRoutes';
import statusRoutes from './routes/statusRoutes';
import ticketRoutes from './routes/ticketRoutes';
import commentRoutes from './routes/commentRoutes';
import attachmentRoutes from './routes/attachmentRoutes';

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
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/priorities', priorityRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/attachments', attachmentRoutes);

// Error handler (toujours en dernier)
app.use(errorHandler);

export default app;