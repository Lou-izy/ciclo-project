import { Response, NextFunction } from 'express';
import { CollectionService } from '../services/collection.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class CollectionController {
  public static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const collections = await CollectionService.getCollections(req.user!.id);
      res.json({
        success: true,
        count: collections.length,
        data: collections,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const collection = await CollectionService.getCollectionById(req.params.id);
      res.json({
        success: true,
        data: collection,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { material, weightKg, pointId } = req.body;
      const created = await CollectionService.createCollection(req.user!.id, {
        material,
        weightKg,
        pointId,
      });
      res.status(201).json({
        success: true,
        message: 'Depósito verificado e registrado com sucesso',
        data: created,
      });
    } catch (err) {
      next(err);
    }
  }

}
