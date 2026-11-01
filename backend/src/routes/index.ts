import { Router } from 'express';
import authRoutes from './auth.routes.js';
import collectionRoutes from './collection.routes.js';
import walletRoutes from './wallet.routes.js';
import impactRoutes from './impact.routes.js';
import pointRoutes from './point.routes.js';
import materialRoutes from './material.routes.js';
import notificationRoutes from './notification.routes.js';
import trackingRoutes from './tracking.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/collections', collectionRoutes);
apiRouter.use('/wallet', walletRoutes);
apiRouter.use('/impact', impactRoutes);
apiRouter.use('/points', pointRoutes);
apiRouter.use('/materials', materialRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/track', trackingRoutes);

export default apiRouter;
