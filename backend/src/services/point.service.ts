import { db } from '../database/db.js';
import { CollectionPoint } from '../models/types.js';

export class PointService {
  public static async getAllPoints(): Promise<CollectionPoint[]> {
    return db.getPoints();
  }

  public static async getPointById(id: string): Promise<CollectionPoint | undefined> {
    return db.getPointById(id);
  }
}
