import { Response, NextFunction } from 'express';
import { ImpactService } from '../services/impact.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class ImpactController {
  public static async getMyImpact(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await ImpactService.getUserImpact(req.user!.id);
      res.json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }
}
