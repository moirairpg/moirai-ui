export type NotificationType = 'BROADCAST' | 'SYSTEM' | 'GAME';
export type NotificationLevel = 'INFO' | 'URGENT';

export type NotificationDetails = {
  publicId: string;
  message: string;
  type: NotificationType;
  level: NotificationLevel | null;
  targetUsernames: string[];
  adventureId: string | null;
  isInteractable: boolean;
  metadata: Record<string, unknown> | null;
  creationDate: string;
  lastUpdateDate: string;
};

export type NotificationSummary = {
  publicId: string;
  message: string;
  type: NotificationType;
  level: NotificationLevel | null;
  creationDate: string;
};

export type SearchNotificationsParams = {
  type?: NotificationType;
  level?: NotificationLevel;
  receiverId?: string;
  page?: number;
  size?: number;
};

export type CreateNotificationInput = {
  message: string;
  type: 'BROADCAST' | 'SYSTEM';
  level: NotificationLevel;
  targetUsernames: string[];
  isInteractable: boolean;
};

export type UpdateNotificationInput = {
  message: string;
  level: NotificationLevel;
};
