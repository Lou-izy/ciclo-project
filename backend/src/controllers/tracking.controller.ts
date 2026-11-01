import { Request, Response, NextFunction } from 'express';
import { db } from '../database/db.js';

export class TrackingController {
  public static async trackByIdentifier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tag = req.params.tag;
      const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
      const collections = (await db.getCollectionsByIdentifier(cleanTag))
        .filter((collection) => collection.status === 'Verificado');

      if (collections.length === 0) {
        res.status(404).json({
          success: false,
          error: `Nenhuma entrega encontrada para a etiqueta ${cleanTag}`,
        });
        return;
      }

      res.json({
        success: true,
        tag: cleanTag,
        totalDeliveries: collections.length,
        deliveries: collections,
      });
    } catch (err) {
      next(err);
    }
  }
}
