import { useTranslation } from 'react-i18next';
import type { SearchUsersParams, UserRole } from '../types';

type UsersFilterBarProps = {
  filters: SearchUsersParams;
  onChange: <K extends keyof SearchUsersParams>(key: K, value: SearchUsersParams[K] | '') => void;
};

const INPUT_CLASS = 'rounded border border-border bg-background px-3 py-2 text-sm';

const toDateInputValue = (value?: string) => (value ? value.slice(0, 10) : '');

export function UsersFilterBar({ filters, onChange }: UsersFilterBarProps) {
  const { t } = useTranslation('users');

  const handleDateChange = (key: 'registeredFrom' | 'registeredTo', value: string) => {
    if (!value) {
      onChange(key, '');
      return;
    }

    const time = key === 'registeredFrom' ? 'T00:00:00.000Z' : 'T23:59:59.999Z';
    onChange(key, new Date(`${value}${time}`).toISOString());
  };

  return (
    <section className="mb-4 flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">{t('filters.username')}</span>
        <input
          className={INPUT_CLASS}
          type="text"
          value={filters.username ?? ''}
          onChange={(e) => onChange('username', e.target.value)}
          placeholder={t('filters.usernamePlaceholder')}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">{t('filters.role')}</span>
        <select
          className={INPUT_CLASS}
          value={filters.role ?? ''}
          onChange={(e) => onChange('role', (e.target.value as UserRole) || '')}
        >
          <option value="">{t('filters.any')}</option>
          <option value="PLAYER">{t('roles.PLAYER')}</option>
          <option value="ADMIN">{t('roles.ADMIN')}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">{t('filters.status')}</span>
        <select
          className={INPUT_CLASS}
          value={filters.isActive === undefined ? '' : String(filters.isActive)}
          onChange={(e) => onChange('isActive', e.target.value === '' ? '' : e.target.value === 'true')}
        >
          <option value="">{t('filters.any')}</option>
          <option value="true">{t('status.active')}</option>
          <option value="false">{t('status.inactive')}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">{t('filters.registeredFrom')}</span>
        <input
          className={INPUT_CLASS}
          type="date"
          value={toDateInputValue(filters.registeredFrom)}
          onChange={(e) => handleDateChange('registeredFrom', e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">{t('filters.registeredTo')}</span>
        <input
          className={INPUT_CLASS}
          type="date"
          value={toDateInputValue(filters.registeredTo)}
          onChange={(e) => handleDateChange('registeredTo', e.target.value)}
        />
      </label>
    </section>
  );
}
