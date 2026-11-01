import { OAuth2Client } from 'google-auth-library';
import { ENV } from '../config/env.js';
import { AppError } from '../middlewares/error.middleware.js';

export type GoogleIdentity = {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
};

const client = new OAuth2Client();

export class GoogleAuthService {
  public static async verifyCredential(credential: string): Promise<GoogleIdentity> {
    if (!ENV.GOOGLE_CLIENT_ID) {
      throw new AppError('GOOGLE_CLIENT_ID não está configurado no servidor.', 500, 'GOOGLE_AUTH_NOT_CONFIGURED');
    }

    try {
      const ticket = await client.verifyIdToken({ idToken: credential, audience: ENV.GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email || !payload.email_verified) {
        throw new AppError('A conta Google não possui um e-mail verificado.', 401, 'UNVERIFIED_GOOGLE_ACCOUNT');
      }

      return {
        googleId: payload.sub,
        email: payload.email.toLowerCase(),
        name: payload.name?.trim() || payload.email,
        avatarUrl: payload.picture,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Credencial Google inválida ou expirada.', 401, 'INVALID_GOOGLE_CREDENTIAL');
    }
  }
}