import type { Dispatch, SetStateAction } from 'react';

export type SettingsMainTab = 'account' | 'appearance' | 'gameplay';
export type ProjectSortOrder = 'name' | 'date';
export type SaveStatus = 'success' | 'error' | null;

export type NotificationPreferencesState = {
  channels: {
    inApp: boolean;
    webPush: boolean;
  };
  events: {
    actionRequired: boolean;
    stop: boolean;
    error: boolean;
  };
};

export type SettingsProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type SetState<T> = Dispatch<SetStateAction<T>>;
