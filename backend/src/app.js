
const { setupSwagger } = require('./config/swagger');
const { errorHandler } = require('./middleware/errorHandler');
// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const locationRoutes = require('./routes/locationRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const priorityRoutes = require('./routes/priorityRoutes');
const statusRoutes = require('./routes/statusRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const commentRoutes = require('./routes/commentRoutes');

const attachmentRoutes = require('./routes/attachmentRoutes');
const app = express();
// Middleware globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, ';..', 'uploads')));
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
// Gestion centralisée des erreurs (toujours en dernier)
app.use(errorHandler);
module.exports = app;