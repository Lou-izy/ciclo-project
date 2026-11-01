import { Request, Response, NextFunction } from 'express';
import { MaterialService } from '../services/material.service.js';

export class MaterialController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const materials = await MaterialService.getAllMaterials();
      res.json({
        success: true,
        count: materials.length,
        data: materials,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getByLabel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const material = await MaterialService.getMaterialByLabel(req.params.label);
      if (!material) {
        res.status(404).json({
          success: false,
          error: 'Material não encontrado. Opções válidas: MET, PAP, PLS',
        });
        return;
      }
      res.json({
        success: true,
        data: material,
      });
    } catch (err) {
      next(err);
    }
  }
}
