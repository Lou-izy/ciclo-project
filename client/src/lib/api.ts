const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const SESSION_KEY = "ciclo-session";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  identifierTag: string;
  status: "Ativo" | "Inativo";
  createdAt: string;
};

export type AuthSession = { token: string; user: User };
export type MaterialType = "MET" | "PAP" | "PLS";

export type Collection = {
  id: string;
  date: string;
  createdAt: string;
  material: MaterialType;
  materialName: string;
  weightKg: number;
  weightFormatted: string;
  detail: string;
  pointName?: string;
  tokensCredited?: number;
};

export type TokenTransaction = {
  id: string;
  date: string;
  time: string;
  title: string;
  amount: number;
  amountFormatted: string;
  positive: boolean;
  detail: string;
  status: string;
  createdAt: string;
};

export type WalletSummary = {
  balanceTokens: number;
  tokensThisMonth: number;
  totalDeliveredKg: number;
  totalTokensGenerated: number;
  tokenRatioText: string;
};

export type MaterialInfo = {
  label: MaterialType;
  name: string;
  totalKg: number;
  percentage: number;
  className: string;
  whatToDiscard: string;
  howToPrepare: string;
};

export type CollectionPoint = {
  id: string;
  code: string;
  name: string;
  address: string;
  hours: string;
  status: "Aberto" | "Fechado";
  specialNotes?: string;
};

export type ImpactStats = {
  totalWeightKg: number;
  totalWeightFormatted: string;
  materials: MaterialInfo[];
};

export type NotificationItem = {
  id: string;
  title: string;
  subtitle: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: "info" | "success" | "alert";
};

type ApiEnvelope<T> = { success: boolean; data: T; error?: string };

export function loadAuthSession(): AuthSession | null {
  try {
    const stored = window.localStorage.getItem(SESSION_KEY);
    return stored ? (JSON.parse(stored) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession | null) {
  if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(SESSION_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");

  const session = loadAuthSession();
  if (session?.token) headers.set("Authorization", `Bearer ${session.token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new Error("Não foi possível conectar à API. Verifique se o backend está em execução.");
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || `Falha na API (${response.status}).`);
  }
  return payload.data;
}

async function requestBlob(path: string): Promise<Blob> {
  const headers = new Headers();
  const session = loadAuthSession();
  if (session?.token) headers.set("Authorization", `Bearer ${session.token}`);

  const response = await fetch(`${API_BASE}${path}`, { headers });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || `Falha na API (${response.status}).`);
  }
  return response.blob();
}

export const cicloApi = {
  login: (credential: string) =>
    request<AuthSession>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),
  getProfile: () => request<User>("/auth/me"),
  updateProfile: (profile: { name: string; email: string }) =>
    request<User>("/auth/me", { method: "PUT", body: JSON.stringify(profile) }),
  getCollections: () => request<Collection[]>("/collections"),
  getWallet: () => request<WalletSummary>("/wallet"),
  getTransactions: () => request<TokenTransaction[]>("/wallet/transactions"),
  getImpact: () => request<ImpactStats>("/impact"),
  getMaterials: () => request<MaterialInfo[]>("/materials"),
  getPoints: () => request<CollectionPoint[]>("/points"),
  getNotifications: () => request<NotificationItem[]>("/notifications"),
  markAllNotificationsAsRead: () =>
    request<null>("/notifications/read-all", { method: "PATCH" }),
  downloadStatement: () => requestBlob("/wallet/statement/pdf"),
};