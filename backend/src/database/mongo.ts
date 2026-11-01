import mongoose, { Schema } from 'mongoose';
import {
  Collection,
  CollectionPoint,
  MaterialInfo,
  NotificationItem,
  TokenTransaction,
  User,
  MATERIAL_TYPES,
} from '../models/types.js';
import {
  SEED_COLLECTIONS,
  SEED_MATERIALS,
  SEED_NOTIFICATIONS,
  SEED_POINTS,
  SEED_TRANSACTIONS,
  SEED_USER,
} from './seed.js';
import type { DatabaseStore } from './db.js';

type MongoRecord = Record<string, any>;

function fromDocument<T>(document: MongoRecord | null | undefined, idField = 'id'): T | undefined {
  if (!document) return undefined;
  const { _id, __v, ...record } = document;
  if (idField === 'id') record.id = String(_id);
  return record as T;
}

function createSchema(fields: Record<string, unknown>) {
  return new Schema({ _id: String, ...fields }, { versionKey: false, timestamps: false });
}

const userSchema = createSchema({
  googleId: String,
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  avatarUrl: String,
  identifierTag: { type: String, required: true },
  status: { type: String, enum: ['Ativo', 'Inativo'], default: 'Ativo' },
  createdAt: { type: String, required: true },
});
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ identifierTag: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

const collectionSchema = createSchema({
  userId: { type: String, required: true },
  identifierTag: { type: String, required: true },
  date: { type: String, required: true },
  createdAt: { type: String, required: true },
  material: { type: String, enum: [...MATERIAL_TYPES], required: true },
  materialName: { type: String, required: true },
  weightKg: { type: Number, required: true },
  weightFormatted: { type: String, required: true },
  status: { type: String, enum: ['Verificado'], required: true },
  detail: { type: String, required: true },
  pointId: String,
  pointName: String,
  verifiedAt: String,
  tokensCredited: Number,
});
collectionSchema.index({ userId: 1, createdAt: -1 });
collectionSchema.index({ identifierTag: 1, createdAt: -1 });

const transactionSchema = createSchema({
  userId: { type: String, required: true },
  collectionId: String,
  date: { type: String, required: true },
  time: { type: String, required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  amountFormatted: { type: String, required: true },
  positive: { type: Boolean, required: true },
  detail: { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: String, required: true },
});
transactionSchema.index({ userId: 1, createdAt: -1 });

const materialSchema = createSchema({
  label: { type: String, required: true },
  name: { type: String, required: true },
  totalKg: { type: Number, required: true },
  percentage: { type: Number, required: true },
  className: { type: String, required: true },
  color: { type: String, required: true },
  whatToDiscard: { type: String, required: true },
  howToPrepare: { type: String, required: true },
  tokensPerKg: { type: Number, required: true },
});

const pointSchema = createSchema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  hours: { type: String, required: true },
  status: { type: String, enum: ['Aberto', 'Fechado'], required: true },
  specialNotes: String,
  coordinates: { lat: Number, lng: Number },
});

const notificationSchema = createSchema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, required: true, default: false },
  createdAt: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'alert'], required: true },
});
notificationSchema.index({ userId: 1, createdAt: -1 });

const UserModel = mongoose.models.CicloUser ?? mongoose.model('CicloUser', userSchema);
const CollectionModel = mongoose.models.CicloCollection ?? mongoose.model('CicloCollection', collectionSchema);
const TransactionModel = mongoose.models.CicloTransaction ?? mongoose.model('CicloTransaction', transactionSchema);
const MaterialModel = mongoose.models.CicloMaterial ?? mongoose.model('CicloMaterial', materialSchema);
const PointModel = mongoose.models.CicloPoint ?? mongoose.model('CicloPoint', pointSchema);
const NotificationModel = mongoose.models.CicloNotification ?? mongoose.model('CicloNotification', notificationSchema);

async function findById<T>(model: mongoose.Model<any>, id: string, idField = 'id'): Promise<T | undefined> {
  return fromDocument<T>(await model.findById(id).lean().exec(), idField);
}

async function findMany<T>(query: Promise<MongoRecord[]>, idField = 'id'): Promise<T[]> {
  return (await query).map((document) => fromDocument<T>(document, idField)!);
}

async function save<T extends { id: string }>(model: mongoose.Model<any>, value: T): Promise<T> {
  const { id, ...fields } = value;
  const document = await model.findByIdAndUpdate(
    id,
    { $set: fields },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean().exec();
  return fromDocument<T>(document)!;
}

export async function connectMongo(uri: string): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI precisa estar configurada para iniciar a API.');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

export async function seedMongoDatabase(includeDemoData = true): Promise<void> {
  const seedSetOnInsert = async <T extends { id: string }>(model: mongoose.Model<any>, item: T) => {
    const { id, ...fields } = item;
    await model.updateOne({ _id: id }, { $setOnInsert: fields }, { upsert: true }).exec();
  };

  await CollectionModel.updateMany(
    { material: { $in: ['PET', 'PLA'] } },
    { $set: { material: 'PLS', materialName: 'Plástico' } }
  ).exec();
  await MaterialModel.deleteMany({ _id: { $in: ['PET', 'PLA'] } }).exec();

  const legacyTransactions = await TransactionModel.find({ detail: /^(PET|PLA) ·/ }).exec();
  for (const transaction of legacyTransactions) {
    transaction.detail = transaction.detail.replace(/^(PET|PLA)/, 'PLS');
    await transaction.save();
  }

  const legacyNotifications = await NotificationModel.find({ $or: [
    { title: /\b(PET|PLA)\b/ },
    { subtitle: /\b(PET|PLA)\b/ },
    { message: /\b(PET|PLA)\b/ },
  ] }).exec();
  for (const notification of legacyNotifications) {
    notification.title = notification.title.replace(/\b(PET|PLA)\b/g, 'plástico');
    notification.subtitle = notification.subtitle.replace(/\b(PET|PLA)\b/g, 'plástico');
    notification.message = notification.message.replace(/\b(PET|PLA)\b/g, 'plástico');
    await notification.save();
  }

  await NotificationModel.updateOne(
    { _id: 'notif_02', title: 'Entrega em análise no ponto Praça das Artes' },
    { $set: {
      title: 'Depósito verificado no ponto Praça das Artes',
      subtitle: 'Depósito confirmado',
      message: 'Seu depósito identificado com #48237 contendo metal foi verificado e os tokens foram creditados.',
      type: 'success',
    } }
  ).exec();

  await Promise.all(SEED_MATERIALS.map((item) => MaterialModel.updateOne(
    { _id: item.label },
    { $setOnInsert: { ...item, totalKg: 0, percentage: 0 } },
    { upsert: true }
  ).exec()));
  await Promise.all(SEED_POINTS.map((item) => seedSetOnInsert(PointModel, item)));
  if (!includeDemoData) return;
  await seedSetOnInsert(UserModel, SEED_USER);
  await Promise.all(SEED_COLLECTIONS.map((item) => seedSetOnInsert(CollectionModel, item)));
  await Promise.all(SEED_TRANSACTIONS.map((item) => seedSetOnInsert(TransactionModel, item)));
  const creditedTransactions = await TransactionModel.find({ collectionId: { $type: 'string' } }).lean().exec();
  for (const transaction of creditedTransactions) {
    await CollectionModel.updateOne(
      {
        _id: transaction.collectionId,
        $or: [{ status: { $ne: 'Verificado' } }, { tokensCredited: { $exists: false } }],
      },
      {
        $set: {
          status: 'Verificado',
          detail: 'Depósito verificado; tokens liberados',
          verifiedAt: transaction.createdAt,
          tokensCredited: transaction.amount,
        },
      }
    ).exec();
  }
  await Promise.all(SEED_NOTIFICATIONS.map((item) => seedSetOnInsert(NotificationModel, item)));
}

export class MongoDatabase implements DatabaseStore {
  public async getUserById(id: string) { return findById<User>(UserModel, id); }
  public async getUserByEmail(email: string) {
    return fromDocument<User>(await UserModel.findOne({ email: email.toLowerCase() }).lean().exec());
  }
  public async getUserByGoogleId(googleId: string) {
    return fromDocument<User>(await UserModel.findOne({ googleId }).lean().exec());
  }
  public async getUserByIdentifier(tag: string) {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    return fromDocument<User>(await UserModel.findOne({ identifierTag: normalizedTag }).lean().exec());
  }
  public async saveUser(user: User) { return save(UserModel, user); }
  public async getAllCollections(userId?: string) {
    return findMany<Collection>(CollectionModel.find(userId ? { userId } : {}).sort({ createdAt: -1 }).lean().exec());
  }
  public async getCollectionById(id: string) { return findById<Collection>(CollectionModel, id); }
  public async getCollectionsByIdentifier(tag: string) {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    return findMany<Collection>(CollectionModel.find({ identifierTag: normalizedTag }).sort({ createdAt: -1 }).lean().exec());
  }
  public async saveCollection(collection: Collection) { return save(CollectionModel, collection); }
  public async getTransactions(userId?: string) {
    return findMany<TokenTransaction>(TransactionModel.find(userId ? { userId } : {}).sort({ createdAt: -1 }).lean().exec());
  }
  public async saveTransaction(transaction: TokenTransaction) { return save(TransactionModel, transaction); }
  public async getMaterials() {
    return findMany<MaterialInfo>(MaterialModel.find().sort({ _id: 1 }).lean().exec(), 'label');
  }
  public async getMaterial(label: string) {
    return fromDocument<MaterialInfo>(await MaterialModel.findById(label).lean().exec(), 'label');
  }
  public async getPoints() {
    return findMany<CollectionPoint>(PointModel.find().sort({ code: 1 }).lean().exec());
  }
  public async getPointById(id: string) { return findById<CollectionPoint>(PointModel, id); }
  public async getNotifications(userId: string) {
    return findMany<NotificationItem>(NotificationModel.find({ userId }).sort({ createdAt: -1 }).lean().exec());
  }
  public async saveNotification(notification: NotificationItem) { return save(NotificationModel, notification); }
  public async markNotificationAsRead(id: string, userId: string) {
    return fromDocument<NotificationItem>(await NotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { read: true } },
      { new: true }
    ).lean().exec());
  }
  public async markAllNotificationsAsRead(userId: string) {
    await NotificationModel.updateMany({ userId, read: false }, { $set: { read: true } }).exec();
  }
}