// src/app/notification/page.tsx

import NotificationClient from '@/app/notification/NotificationClient';
import {
  deleteNotification,
  getNotifications,
  publishNotification,
} from '@/lib/server/notification.action';

export default async function NotificationPage() {
  const initialNotifications = await getNotifications();

  return (
    <NotificationClient
      initialNotifications={initialNotifications}
      onDeleteAction={deleteNotification}
      onPublishAction={publishNotification}
    />
  );
}
