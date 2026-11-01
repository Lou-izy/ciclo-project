import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'http';
import { createApp } from '../app.js';
import { db } from '../database/db.js';
import { GoogleAuthService } from '../services/google-auth.service.js';
import { AuthService } from '../services/auth.service.js';

let server: Server;
let baseUrl: string;
let authToken = '';
const originalGoogleVerifier = GoogleAuthService.verifyCredential;

function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${authToken}`);
  return fetch(`${baseUrl}${path}`, { ...init, headers });
}

describe('Ciclo Reciclagem API Test Suite', () => {
  before(async () => {
    db.reset();
    GoogleAuthService.verifyCredential = async (credential) => {
      if (credential === 'test-google-credential') {
        return {
          googleId: 'google-test-user-1',
          email: 'marina.costa@email.com',
          name: 'Marina Costa',
        };
      }
      if (credential === 'new-user-google-credential') {
        return {
          googleId: 'google-test-user-2',
          email: 'new.user@example.com',
          name: 'New User',
        };
      }
      throw new Error('Invalid test credential');
    };
    authToken = (await AuthService.loginWithGoogle('test-google-credential')).token;
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (typeof address === 'object' && address) {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    GoogleAuthService.verifyCredential = originalGoogleVerifier;
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  test('GET /health returns 200 and status OK', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'OK');
    assert.equal(body.service, 'Ciclo Reciclagem Backend API');
  });

  test('POST /api/auth/google returns JWT token and user profile', async () => {
    const res = await fetch(`${baseUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: 'test-google-credential' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token);
    assert.equal(body.data.user.email, 'marina.costa@email.com');
    assert.equal(body.data.user.identifierTag, '#48237');
  });

  test('POST /api/auth/google rejects requests without a credential', async () => {
    const res = await fetch(`${baseUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'new.user@example.com' }),
    });
    assert.equal(res.status, 400);
  });

  test('New Google users do not inherit demo wallet or impact data', async () => {
    const login = await fetch(`${baseUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: 'new-user-google-credential' }),
    });
    assert.equal(login.status, 200);
    const session = await login.json();
    const headers = { Authorization: `Bearer ${session.data.token}` };

    const walletResponse = await fetch(`${baseUrl}/api/wallet`, { headers });
    const wallet = await walletResponse.json();
    assert.equal(wallet.data.balanceTokens, 0);
    assert.equal(wallet.data.tokensThisMonth, 0);

    const impactResponse = await fetch(`${baseUrl}/api/impact`, { headers });
    const impact = await impactResponse.json();
    assert.equal(impact.data.totalWeightKg, 0);
  });

  test('Protected routes reject requests without a JWT', async () => {
    const res = await fetch(`${baseUrl}/api/collections`);
    assert.equal(res.status, 401);
  });

  test('GET /api/collections/latest is no longer available', async () => {
    const res = await apiFetch('/api/collections/latest');
    assert.equal(res.status, 404);
  });

  test('GET /api/collections returns collection history', async () => {
    const res = await apiFetch('/api/collections');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 4);
    assert.ok(body.data.every((collection: { status: string }) => collection.status === 'Verificado'));
  });

  test('Collection history hides legacy deposits that are not verified', async () => {
    await db.saveCollection({
      id: 'legacy_pending',
      userId: 'usr_ciclo_48237',
      identifierTag: '#48237',
      date: '01 nov 2026',
      createdAt: new Date().toISOString(),
      material: 'MET',
      materialName: 'Metal',
      weightKg: 1,
      weightFormatted: '1,00 kg',
      status: 'Em análise' as never,
      detail: 'Aguardando verificação',
    });

    const res = await apiFetch('/api/collections');
    const body = await res.json();
    assert.equal(body.data.some((collection: { id: string }) => collection.id === 'legacy_pending'), false);
  });

  test('POST /api/collections creates a deposit only after verification', async () => {
    const res = await apiFetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        material: 'PLS',
        weightKg: 2.8,
        pointId: 'pt_01',
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.material, 'PLS');
    assert.equal(body.data.status, 'Verificado');
    assert.equal(body.data.identifierTag, '#48237');
    assert.ok(body.data.verifiedAt);
    assert.ok(body.data.tokensCredited > 0);
  });

  test('POST /api/collections rejects deposits without verified weight', async () => {
    const res = await apiFetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ material: 'MET' }),
    });
    assert.equal(res.status, 400);
  });

  test('PATCH /api/collections/:id/status is no longer available', async () => {
    const res = await apiFetch('/api/collections/col_01/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Verificado' }),
    });
    assert.equal(res.status, 404);
  });

  test('GET /api/wallet returns wallet balance and monthly tokens', async () => {
    const res = await apiFetch('/api/wallet');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.balanceTokens >= 2480);
    assert.ok(body.data.tokensThisMonth >= 0);
  });

  test('GET /api/wallet/transactions returns ledger items', async () => {
    const res = await apiFetch('/api/wallet/transactions');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  test('GET /api/wallet/statement/pdf downloads valid PDF file', async () => {
    const res = await apiFetch('/api/wallet/statement/pdf');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/pdf');
    const buf = await res.arrayBuffer();
    const str = Buffer.from(buf).toString('utf8', 0, 8);
    assert.ok(str.startsWith('%PDF-1.4'));
  });

  test('GET /api/impact returns materials breakdown and environmental impact', async () => {
    const res = await apiFetch('/api/impact');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.totalWeightKg > 0);
    assert.ok(body.data.co2AvoidedKg > 0);
    assert.equal(body.data.materials.length, 3);
  });

  test('GET /api/materials returns MET, PAP, PLS guidelines', async () => {
    const res = await apiFetch('/api/materials');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.length, 3);
    assert.deepEqual(body.data.map((material: { label: string }) => material.label), ['MET', 'PAP', 'PLS']);
  });

  test('GET /api/points returns collection points (Praça das Artes, Mercado Central)', async () => {
    const res = await apiFetch('/api/points');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.some((p: any) => p.name === 'Praça das Artes'));
  });

  test('GET /api/notifications returns user notification list', async () => {
    const res = await apiFetch('/api/notifications');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.length > 0);
  });

  test('GET /api/track/:tag returns verified deposits without progress stages', async () => {
    const res = await fetch(`${baseUrl}/api/track/48237`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.tag, '#48237');
    assert.ok(body.deliveries.length > 0);
    assert.ok(body.deliveries.every((collection: { status: string }) => collection.status === 'Verificado'));
    assert.equal('stages' in body, false);
  });
});
