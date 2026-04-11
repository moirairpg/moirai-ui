export type SettingsMainTab = 'account' | 'appearance' | 'gameplay';

export type SettingsProps = {
  isOpen: boolean;
  onClose: () => void;
};
