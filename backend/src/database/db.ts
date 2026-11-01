import { User, Collection, TokenTransaction, MaterialInfo, CollectionPoint, NotificationItem } from '../models/types.js';
import {
  SEED_USER,
  SEED_MATERIALS,
  SEED_POINTS,
  SEED_COLLECTIONS,
  SEED_TRANSACTIONS,
  SEED_NOTIFICATIONS,
} from './seed.js';
import { MongoDatabase, connectMongo, disconnectMongo, seedMongoDatabase } from './mongo.js';

export interface DatabaseStore {
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByIdentifier(tag: string): Promise<User | undefined>;
  saveUser(user: User): Promise<User>;
  getAllCollections(userId?: string): Promise<Collection[]>;
  getCollectionById(id: string): Promise<Collection | undefined>;
  getCollectionsByIdentifier(tag: string): Promise<Collection[]>;
  saveCollection(collection: Collection): Promise<Collection>;
  getTransactions(userId?: string): Promise<TokenTransaction[]>;
  saveTransaction(transaction: TokenTransaction): Promise<TokenTransaction>;
  getMaterials(): Promise<MaterialInfo[]>;
  getMaterial(label: string): Promise<MaterialInfo | undefined>;
  getPoints(): Promise<CollectionPoint[]>;
  getPointById(id: string): Promise<CollectionPoint | undefined>;
  getNotifications(userId: string): Promise<NotificationItem[]>;
  saveNotification(notification: NotificationItem): Promise<NotificationItem>;
  markNotificationAsRead(id: string, userId: string): Promise<NotificationItem | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
}

class InMemoryDatabase {
  private users = new Map<string, User>();
  private collections = new Map<string, Collection>();
  private transactions = new Map<string, TokenTransaction>();
  private materials = new Map<string, MaterialInfo>();
  private points = new Map<string, CollectionPoint>();
  private notifications = new Map<string, NotificationItem>();

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.users.clear();
    this.collections.clear();
    this.transactions.clear();
    this.materials.clear();
    this.points.clear();
    this.notifications.clear();

    // Populate initial seed data
    this.users.set(SEED_USER.id, { ...SEED_USER });

    SEED_MATERIALS.forEach((m) => this.materials.set(m.label, { ...m }));
    SEED_POINTS.forEach((p) => this.points.set(p.id, { ...p }));
    SEED_COLLECTIONS.forEach((c) => this.collections.set(c.id, { ...c }));
    SEED_TRANSACTIONS.forEach((t) => this.transactions.set(t.id, { ...t }));
    SEED_NOTIFICATIONS.forEach((n) => this.notifications.set(n.id, { ...n }));
  }

  // User queries
  public async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  public async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.googleId === googleId);
  }

  public async getUserByIdentifier(tag: string): Promise<User | undefined> {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    return Array.from(this.users.values()).find(
      (u) => u.identifierTag.toLowerCase() === cleanTag.toLowerCase()
    );
  }

  public async saveUser(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  // Collections queries
  public async getAllCollections(userId?: string): Promise<Collection[]> {
    const list = Array.from(this.collections.values());
    if (userId) {
      return list
        .filter((c) => c.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getCollectionById(id: string): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  public async getCollectionsByIdentifier(tag: string): Promise<Collection[]> {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    return Array.from(this.collections.values())
      .filter((c) => c.identifierTag.toLowerCase() === cleanTag.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async saveCollection(collection: Collection): Promise<Collection> {
    this.collections.set(collection.id, collection);
    return collection;
  }

  // Transactions queries
  public async getTransactions(userId?: string): Promise<TokenTransaction[]> {
    const list = Array.from(this.transactions.values());
    if (userId) {
      return list
        .filter((t) => t.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async saveTransaction(transaction: TokenTransaction): Promise<TokenTransaction> {
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  // Materials queries
  public async getMaterials(): Promise<MaterialInfo[]> {
    return Array.from(this.materials.values());
  }

  public async getMaterial(label: string): Promise<MaterialInfo | undefined> {
    return this.materials.get(label);
  }

  // Points queries
  public async getPoints(): Promise<CollectionPoint[]> {
    return Array.from(this.points.values());
  }

  public async getPointById(id: string): Promise<CollectionPoint | undefined> {
    return this.points.get(id);
  }

  // Notifications queries
  public async getNotifications(userId: string): Promise<NotificationItem[]> {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async saveNotification(notification: NotificationItem): Promise<NotificationItem> {
    this.notifications.set(notification.id, notification);
    return notification;
  }

  public async markNotificationAsRead(id: string, userId: string): Promise<NotificationItem | undefined> {
    const notification = this.notifications.get(id);
    if (!notification || notification.userId !== userId) return undefined;
    notification.read = true;
    return notification;
  }

  public async markAllNotificationsAsRead(userId: string): Promise<void> {
    for (const notification of this.notifications.values()) {
      if (notification.userId === userId) notification.read = true;
    }
  }
}

const memoryDatabase = new InMemoryDatabase();
let activeDatabase: DatabaseStore = memoryDatabase;

export const db: DatabaseStore & { reset(): void } = {
  reset: () => memoryDatabase.reset(),
  getUserById: (id) => activeDatabase.getUserById(id),
  getUserByEmail: (email) => activeDatabase.getUserByEmail(email),
  getUserByGoogleId: (googleId) => activeDatabase.getUserByGoogleId(googleId),
  getUserByIdentifier: (tag) => activeDatabase.getUserByIdentifier(tag),
  saveUser: (user) => activeDatabase.saveUser(user),
  getAllCollections: (userId) => activeDatabase.getAllCollections(userId),
  getCollectionById: (id) => activeDatabase.getCollectionById(id),
  getCollectionsByIdentifier: (tag) => activeDatabase.getCollectionsByIdentifier(tag),
  saveCollection: (collection) => activeDatabase.saveCollection(collection),
  getTransactions: (userId) => activeDatabase.getTransactions(userId),
  saveTransaction: (transaction) => activeDatabase.saveTransaction(transaction),
  getMaterials: () => activeDatabase.getMaterials(),
  getMaterial: (label) => activeDatabase.getMaterial(label),
  getPoints: () => activeDatabase.getPoints(),
  getPointById: (id) => activeDatabase.getPointById(id),
  getNotifications: (userId) => activeDatabase.getNotifications(userId),
  saveNotification: (notification) => activeDatabase.saveNotification(notification),
  markNotificationAsRead: (id, userId) => activeDatabase.markNotificationAsRead(id, userId),
  markAllNotificationsAsRead: (userId) => activeDatabase.markAllNotificationsAsRead(userId),
};

export async function connectDatabase(uri: string, includeDemoData = true): Promise<void> {
  await connectMongo(uri);
  activeDatabase = new MongoDatabase();
  await seedMongoDatabase(includeDemoData);
}

export async function closeDatabase(): Promise<void> {
  await disconnectMongo();
  activeDatabase = memoryDatabase;
}
