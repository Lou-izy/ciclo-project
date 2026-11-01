import { Response, NextFunction } from 'express';
import { WalletService } from '../services/wallet.service.js';
import { PdfService } from '../services/pdf.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class WalletController {
  public static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await WalletService.getWalletSummary(req.user!.id);
      res.json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const result = await WalletService.getTransactions(req.user!.id, limit);
      res.json({
        success: true,
        total: result.total,
        count: result.transactions.length,
        data: result.transactions,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async downloadPdf(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pdfBuffer = await PdfService.generateStatementPdf(req.user!.id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="extrato-tokens-ciclo.pdf"'
      );
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
}
