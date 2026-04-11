import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../../utils/api';
import { DEFAULT_CODE_EDITOR_SETTINGS } from '../constants/constants';
import type {
  CodeEditorSettingsState,
  NotificationPreferencesState,
  ProjectSortOrder,
  SettingsMainTab,
} from '../types/types';

type NotificationPreferencesResponse = {
  success?: boolean;
  preferences?: NotificationPreferencesState;
};

const readCodeEditorSettings = (): CodeEditorSettingsState => ({
  theme: localStorage.getItem('codeEditorTheme') === 'light' ? 'light' : 'dark',
  wordWrap: localStorage.getItem('codeEditorWordWrap') === 'true',
  showMinimap: localStorage.getItem('codeEditorShowMinimap') !== 'false',
  lineNumbers: localStorage.getItem('codeEditorLineNumbers') !== 'false',
  fontSize: localStorage.getItem('codeEditorFontSize') ?? DEFAULT_CODE_EDITOR_SETTINGS.fontSize,
});

const createDefaultNotificationPreferences = (): NotificationPreferencesState => ({
  channels: { inApp: true, webPush: false },
  events: { actionRequired: true, stop: true, error: true },
});

export function useSettingsController({ isOpen }: { isOpen: boolean }) {
  const [activeTab, setActiveTab] = useState<SettingsMainTab>('appearance');
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
  const [projectSortOrder, setProjectSortOrder] = useState<ProjectSortOrder>('name');
  const [codeEditorSettings, setCodeEditorSettings] = useState<CodeEditorSettingsState>(() => readCodeEditorSettings());
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferencesState>(() => createDefaultNotificationPreferences());

  const autoSaveTimerRef = useRef<number | null>(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!isOpen) return;

    const saved = localStorage.getItem('claude-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { projectSortOrder?: ProjectSortOrder };
        if (parsed.projectSortOrder) setProjectSortOrder(parsed.projectSortOrder);
      } catch { /* ignore */ }
    }

    apiFetch('/api/settings/notification-preferences')
      .then((r) => r.json())
      .then((data: NotificationPreferencesResponse) => {
        if (data.success && data.preferences) setNotificationPreferences(data.preferences);
        else setNotificationPreferences(createDefaultNotificationPreferences());
      })
      .catch(() => setNotificationPreferences(createDefaultNotificationPreferences()));
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('codeEditorTheme', codeEditorSettings.theme);
    localStorage.setItem('codeEditorWordWrap', String(codeEditorSettings.wordWrap));
    localStorage.setItem('codeEditorShowMinimap', String(codeEditorSettings.showMinimap));
    localStorage.setItem('codeEditorLineNumbers', String(codeEditorSettings.lineNumbers));
    localStorage.setItem('codeEditorFontSize', codeEditorSettings.fontSize);
    window.dispatchEvent(new Event('codeEditorSettingsChanged'));
  }, [codeEditorSettings]);

  const saveSettings = useCallback(async () => {
    setSaveStatus(null);
    try {
      localStorage.setItem('claude-settings', JSON.stringify({
        projectSortOrder,
        lastUpdated: new Date().toISOString(),
      }));

      const r = await apiFetch('/api/settings/notification-preferences', {
        method: 'PUT',
        body: JSON.stringify(notificationPreferences),
      });
      if (!r.ok) throw new Error();

      setSaveStatus('success');
    } catch {
      setSaveStatus('error');
    }
  }, [notificationPreferences, projectSortOrder]);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (autoSaveTimerRef.current !== null) window.clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = window.setTimeout(() => { void saveSettings(); }, 500);

    return () => {
      if (autoSaveTimerRef.current !== null) window.clearTimeout(autoSaveTimerRef.current);
    };
  }, [saveSettings]);

  useEffect(() => {
    if (saveStatus === null) return;
    const timer = window.setTimeout(() => setSaveStatus(null), 2000);
    return () => window.clearTimeout(timer);
  }, [saveStatus]);

  useEffect(() => {
    if (isOpen) isInitialLoadRef.current = true;
  }, [isOpen]);

  const updateCodeEditorSetting = useCallback(
    <K extends keyof CodeEditorSettingsState>(key: K, value: CodeEditorSettingsState[K]) => {
      setCodeEditorSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return {
    activeTab,
    setActiveTab,
    saveStatus,
    projectSortOrder,
    setProjectSortOrder,
    codeEditorSettings,
    updateCodeEditorSetting,
    notificationPreferences,
    setNotificationPreferences,
  };
}
