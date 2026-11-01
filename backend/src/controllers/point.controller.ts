import { Request, Response, NextFunction } from 'express';
import { PointService } from '../services/point.service.js';

export class PointController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const points = await PointService.getAllPoints();
      res.json({
        success: true,
        count: points.length,
        data: points,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const point = await PointService.getPointById(req.params.id);
      if (!point) {
        res.status(404).json({
          success: false,
          error: 'Ponto de coleta não encontrado',
        });
        return;
      }
      res.json({
        success: true,
        data: point,
      });
    } catch (err) {
      next(err);
    }
  }
}
