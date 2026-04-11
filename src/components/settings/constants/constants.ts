import type { CodeEditorSettingsState, ProjectSortOrder } from '../types/types';

export const DEFAULT_PROJECT_SORT_ORDER: ProjectSortOrder = 'name';

export const DEFAULT_CODE_EDITOR_SETTINGS: CodeEditorSettingsState = {
  theme: 'dark',
  wordWrap: false,
  showMinimap: true,
  lineNumbers: true,
  fontSize: '14',
};
