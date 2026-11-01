import { randomUUID } from 'node:crypto';
import { db } from '../database/db.js';
import {
  Collection,
  MaterialType,
  TokenTransaction,
  NotificationItem,
} from '../models/types.js';
import { AppError } from '../middlewares/error.middleware.js';

export class CollectionService {
  public static async getCollections(userId: string): Promise<Collection[]> {
    return (await db.getAllCollections(userId)).filter((collection) => collection.status === 'Verificado');
  }

  public static async getCollectionById(id: string): Promise<Collection> {
    const collection = await db.getCollectionById(id);
    if (!collection || collection.status !== 'Verificado') {
      throw new AppError('Coleta não encontrada', 404, 'COLLECTION_NOT_FOUND');
    }
    return collection;
  }

  public static async createCollection(
    userId: string,
    data: {
      material: MaterialType;
      weightKg: number;
      pointId?: string;
    }
  ): Promise<Collection> {
    const user = await db.getUserById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    const materialInfo = await db.getMaterial(data.material);
    if (!materialInfo) {
      throw new AppError('Material inválido. Aceitos: MET, PAP, PLS', 400, 'INVALID_MATERIAL');
    }

    const point = data.pointId ? await db.getPointById(data.pointId) : undefined;
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(now);

    const weight = data.weightKg;
    const weightFormatted = `${weight.toFixed(2).replace('.', ',')} kg`;
    const tokensToCredit = Math.round(weight * materialInfo.tokensPerKg);

    const newCollection: Collection = {
      id: `col_${randomUUID()}`,
      userId,
      identifierTag: user.identifierTag,
      date: formattedDate,
      createdAt: now.toISOString(),
      material: data.material,
      materialName: materialInfo.name,
      weightKg: weight,
      weightFormatted,
      status: 'Verificado',
      detail: 'Depósito verificado; tokens liberados',
      pointId: point?.id,
      pointName: point?.name,
      verifiedAt: now.toISOString(),
      tokensCredited: tokensToCredit,
    };

    await db.saveCollection(newCollection);
    const date = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(now);
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const transaction: TokenTransaction = {
      id: `tx_${randomUUID()}`,
      userId,
      collectionId: newCollection.id,
      date,
      time,
      title: 'Tokens por depósito verificado',
      amount: tokensToCredit,
      amountFormatted: `+ ${tokensToCredit}`,
      positive: true,
      detail: `${data.material} · ${weightFormatted}`,
      status: 'Verificado',
      createdAt: now.toISOString(),
    };
    await db.saveTransaction(transaction);

    const notif: NotificationItem = {
      id: `notif_${randomUUID()}`,
      userId,
      title: `${tokensToCredit} tokens creditados na carteira`,
      subtitle: `Depósito de ${materialInfo.name} verificado`,
      message: `Seu depósito de ${weightFormatted} foi verificado e os tokens foram creditados.`,
      read: false,
      createdAt: now.toISOString(),
      type: 'success',
    };
    await db.saveNotification(notif);

    return newCollection;
  }
}
