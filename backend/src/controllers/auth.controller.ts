import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AuthController {
  public static async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { credential } = req.body;
      const session = await AuthService.loginWithGoogle(credential);
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: session,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await AuthService.getProfile(req.user!.id);
      res.json({
        success: true,
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await AuthService.updateProfile(req.user!.id, req.body);
      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}
