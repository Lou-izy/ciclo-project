import { db } from '../database/db.js';
import { NotificationItem } from '../models/types.js';

export class NotificationService {
  public static async getUserNotifications(userId: string): Promise<{
    notifications: NotificationItem[];
    unreadCount: number;
  }> {
    const notifications = await db.getNotifications(userId);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
      notifications,
      unreadCount,
    };
  }

  public static markAsRead(id: string, userId: string): Promise<NotificationItem | undefined> {
    return db.markNotificationAsRead(id, userId);
  }

  public static markAllAsRead(userId: string): Promise<void> {
    return db.markAllNotificationsAsRead(userId);
  }
}
