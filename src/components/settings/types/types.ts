import type { Dispatch, SetStateAction } from 'react';

export type SettingsMainTab = 'appearance' | 'notifications';
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

export type CodeEditorSettingsState = {
  theme: 'dark' | 'light';
  wordWrap: boolean;
  showMinimap: boolean;
  lineNumbers: boolean;
  fontSize: string;
};

export type SettingsProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type SetState<T> = Dispatch<SetStateAction<T>>;
