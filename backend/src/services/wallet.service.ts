import { db } from '../database/db.js';
import { TokenTransaction, WalletSummary } from '../models/types.js';

export class WalletService {
  public static async getWalletSummary(userId: string): Promise<WalletSummary> {
    const [transactions, collections] = await Promise.all([
      db.getTransactions(userId),
      db.getAllCollections(userId),
    ]);
    const balanceTokens = transactions.reduce((total, transaction) => {
      return total + (transaction.positive ? transaction.amount : -transaction.amount);
    }, 0);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const tokensThisMonth = transactions
      .filter((transaction) => new Date(transaction.createdAt) >= monthStart)
      .reduce((total, transaction) => total + (transaction.positive ? transaction.amount : -transaction.amount), 0);

    const totalDeliveredKg = collections
      .filter((c) => c.status === 'Verificado')
      .reduce((acc, c) => acc + (c.weightKg || 0), 0);

    const totalTokensGenerated = balanceTokens;

    return {
      userId,
      balanceTokens,
      tokensThisMonth,
      totalDeliveredKg: Number(totalDeliveredKg.toFixed(2)),
      totalTokensGenerated,
      tokenRatioText: '1 token = impacto registrado',
    };
  }

  public static async getTransactions(
    userId: string,
    limit?: number
  ): Promise<{
    transactions: TokenTransaction[];
    total: number;
  }> {
    const all = await db.getTransactions(userId);
    const result = typeof limit === 'number' && limit > 0 ? all.slice(0, limit) : all;

    return {
      transactions: result,
      total: all.length,
    };
  }
}
