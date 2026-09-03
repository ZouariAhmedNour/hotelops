// src/routes/serviceRoutes.ts
// Point d'entrée unique du module : app.use('/api/services', serviceRoutes)
import { Router } from 'express';
import serviceCategoryRoutes from './serviceCategoryRoutes';
import serviceItemRoutes from './serviceItemRoutes';
import roomServiceRoutes from './roomServiceRoutes';
import restaurantRoutes from './restaurantRoutes';
import spaRoutes from './spaRoutes';
import serviceBookingRoutes from './serviceBookingRoutes';

const router = Router();

router.use('/categories', serviceCategoryRoutes);
router.use('/items', serviceItemRoutes);
router.use('/room-service', roomServiceRoutes);
router.use('/restaurant', restaurantRoutes);
router.use('/spa', spaRoutes);
router.use('/bookings', serviceBookingRoutes);

export default router;