import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', WalletController.getSummary);
router.get('/transactions', WalletController.getTransactions);
router.get('/statement/pdf', WalletController.downloadPdf);

export default router;
