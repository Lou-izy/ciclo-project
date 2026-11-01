import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class NotificationController {
  public static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await NotificationService.getUserNotifications(req.user!.id);
      res.json({
        success: true,
        unreadCount: result.unreadCount,
        data: result.notifications,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notif = await NotificationService.markAsRead(req.params.id, req.user!.id);
      if (!notif) {
        res.status(404).json({
          success: false,
          error: 'Notificação não encontrada',
        });
        return;
      }
      res.json({
        success: true,
        message: 'Notificação marcada como lida',
        data: notif,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await NotificationService.markAllAsRead(req.user!.id);
      res.json({
        success: true,
        message: 'Todas as notificações foram marcadas como lidas',
      });
    } catch (err) {
      next(err);
    }
  }
}
