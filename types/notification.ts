// types/notification.ts
export type NotificationType =
  | 'GALLERY_ADDED'
  | 'REEL_ADDED'
  | 'TRANSFER_SENT'
  | 'ORNAMENT_ADDED';

export interface NotificationUser {
  id: number; // Prisma Int 타입에 맞춤
  name: string;
  userId: string;
  profileImageUrl: string | null;
}

export interface NotificationItemProps {
  user: NotificationUser;
  type: NotificationType;
  message: string;
  createdAt: string | Date;
  isRead: boolean;
  thumbnailUrl?: string;
  onDelete: () => void;
  onPublish: () => void;
}
