import { db } from '../database/db.js';
import { ImpactStats, MaterialInfo } from '../models/types.js';

export class ImpactService {
  public static async getUserImpact(userId: string): Promise<ImpactStats> {
    const [allCollections, materials] = await Promise.all([
      db.getAllCollections(userId),
      db.getMaterials(),
    ]);
    const collections = allCollections.filter((c) => c.status === 'Verificado');

    // Group verified weight by material
    const weightsByMaterial: Record<string, number> = {
      MET: 0,
      PAP: 0,
      PLS: 0,
    };

    collections.forEach((c) => {
      if (weightsByMaterial[c.material] !== undefined) {
        weightsByMaterial[c.material] += c.weightKg || 0;
      }
    });

    const metKg = weightsByMaterial.MET;
    const paperKg = weightsByMaterial.PAP;
    const plasticKg = weightsByMaterial.PLS;

    const totalWeightKg = Number((metKg + paperKg + plasticKg).toFixed(1));

    const updatedMaterials: MaterialInfo[] = materials.map((m) => {
      let value = 0;
      let percent = 0;
      if (m.label === 'MET') {
        value = metKg;
        percent = Math.min(100, Math.round((value / 11.3) * 100));
      } else if (m.label === 'PAP') {
        value = paperKg;
        percent = Math.min(100, Math.round((value / 11.2) * 100));
      } else if (m.label === 'PLS') {
        value = plasticKg;
        percent = Math.min(100, Math.round((value / 11.0) * 100));
      }

      return {
        ...m,
        totalKg: Number(value.toFixed(1)),
        percentage: percent,
      };
    });

    // Calculations based on standard LCA recycling metrics
    // ~2.5 kg CO2 avoided per kg recycled waste
    const co2AvoidedKg = Number((totalWeightKg * 2.45).toFixed(1));
    // ~1 tree absorbs ~20kg CO2 per year
    const treesEquivalent = Number((co2AvoidedKg / 20).toFixed(2));
    // ~26 liters of water saved per kg of recycled plastics & metals
    const waterSavedLiters = Math.round(totalWeightKg * 26);

    return {
      totalWeightKg,
      totalWeightFormatted: `${totalWeightKg.toString().replace('.', ',')} kg`,
      co2AvoidedKg,
      treesEquivalent,
      waterSavedLiters,
      materials: updatedMaterials,
    };
  }
}
