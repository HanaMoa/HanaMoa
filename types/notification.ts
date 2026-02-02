// types/notification.ts
export type NotificationType =
  | 'GALLERY_ADDED'
  | 'REEL_ADDED'
  | 'TRANSFER_SENT'
  | 'ORNAMENT_ADDED';

export interface NotificationUser {
  id: number;
  name: string;
  userId: string;
  profileImageUrl: string | null;
}

export type NotificationDTO = {
  id: number;
  type: NotificationType;
  message: string;
  createdAt: string; // ISO string
  isRead: boolean;
  thumbnailUrl: string | null;
  user: NotificationUser; // actor
};
