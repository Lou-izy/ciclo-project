export const MATERIAL_TYPES = ['MET', 'PAP', 'PLS'] as const;
export type MaterialType = (typeof MATERIAL_TYPES)[number];

export type CollectionStatus = 'Verificado';

export interface User {
  id: string;
  googleId?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  identifierTag: string; // e.g. "#48237"
  status: 'Ativo' | 'Inativo';
  createdAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  identifierTag: string;
  date: string; // e.g. "06 set 2026"
  createdAt: string;
  material: MaterialType;
  materialName: string; // "Metal", "Papel" or "Plástico"
  weightKg: number; // e.g. 3.8
  weightFormatted: string; // "3,80 kg"
  status: CollectionStatus;
  detail: string; // e.g. "Aguardando validação do peso", "Tokens liberados"
  pointId?: string;
  pointName?: string;
  verifiedAt?: string;
  tokensCredited?: number;
}

export interface TokenTransaction {
  id: string;
  userId: string;
  collectionId?: string;
  date: string; // e.g. "06 set 2026"
  time: string; // e.g. "14:32"
  title: string; // e.g. "Tokens por coleta verificada"
  amount: number; // e.g. 184
  amountFormatted: string; // "+ 184"
  positive: boolean;
  detail: string; // e.g. "MET · 3,80 kg"
  status: string; // e.g. "Verificado"
  createdAt: string;
}

export interface WalletSummary {
  userId: string;
  balanceTokens: number;
  tokensThisMonth: number;
  totalDeliveredKg: number;
  totalTokensGenerated: number;
  tokenRatioText: string;
}

export interface MaterialInfo {
  label: MaterialType;
  name: string;
  totalKg: number;
  percentage: number;
  className: string;
  color: string;
  whatToDiscard: string;
  howToPrepare: string;
  tokensPerKg: number;
}

export interface CollectionPoint {
  id: string;
  code: string; // "01", "02"
  name: string; // "Praça das Artes"
  address: string;
  hours: string; // "Seg–sáb · 08:00–19:00"
  status: 'Aberto' | 'Fechado';
  specialNotes?: string; // "No feriado de 07/09, fecha às 13h."
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  subtitle: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'info' | 'success' | 'alert';
}

export interface ImpactStats {
  totalWeightKg: number;
  totalWeightFormatted: string;
  co2AvoidedKg: number;
  treesEquivalent: number;
  waterSavedLiters: number;
  materials: MaterialInfo[];
}

export interface AuthSession {
  token: string;
  user: User;
}
