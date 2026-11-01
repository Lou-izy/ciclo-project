import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { ENV } from '../config/env.js';
import { db } from '../database/db.js';
import { User, AuthSession } from '../models/types.js';
import { AppError } from '../middlewares/error.middleware.js';
import { GoogleAuthService } from './google-auth.service.js';

export class AuthService {
  public static async loginWithGoogle(credential: string): Promise<AuthSession> {
    const identity = await GoogleAuthService.verifyCredential(credential);
    let user = await db.getUserByGoogleId(identity.googleId);
    if (!user) user = await db.getUserByEmail(identity.email);

    if (!user) {
      let identifierTag: string;
      do {
        identifierTag = `#${Math.floor(10000 + Math.random() * 90000)}`;
      } while (await db.getUserByIdentifier(identifierTag));

      user = {
        id: `usr_${randomUUID()}`,
        googleId: identity.googleId,
        name: identity.name,
        email: identity.email,
        avatarUrl: identity.avatarUrl,
        identifierTag,
        status: 'Ativo',
        createdAt: new Date().toISOString(),
      };
    } else {
      user.googleId = identity.googleId;
      user.email = identity.email;
      user.avatarUrl = identity.avatarUrl;
    }
    user = await db.saveUser(user);

    const token = jwt.sign({ userId: user.id, email: user.email, googleId: identity.googleId }, ENV.JWT_SECRET, {
      expiresIn: '30d',
    });

    return {
      token,
      user: this.toPublicUser(user),
    };
  }

  public static async getProfile(userId: string): Promise<User> {
    const user = await db.getUserById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }
    return this.toPublicUser(user);
  }

  public static async updateProfile(
    userId: string,
    data: { name?: string; email?: string }
  ): Promise<User> {
    const user = await db.getUserById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    if (data.name) user.name = data.name.trim();
    if (data.email) user.email = data.email.trim().toLowerCase();

    await db.saveUser(user);
    return this.toPublicUser(user);
  }

  private static toPublicUser(user: User): User {
    const { googleId: _googleId, ...publicUser } = user;
    return publicUser;
  }
}
