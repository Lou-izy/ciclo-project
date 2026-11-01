import { db } from '../database/db.js';
import { MaterialInfo } from '../models/types.js';

export class MaterialService {
  public static async getAllMaterials(): Promise<MaterialInfo[]> {
    return db.getMaterials();
  }

  public static async getMaterialByLabel(label: string): Promise<MaterialInfo | undefined> {
    return db.getMaterial(label.toUpperCase());
  }
}
