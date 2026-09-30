import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UsernameChipInput } from '../../notifications/components/UsernameChipInput';
import { api, extractApiError } from '../../../utils/api';

type InvitePlayersFieldProps = { adventureId: string };

export function InvitePlayersField({ adventureId }: InvitePlayersFieldProps) {
  const { t } = useTranslation('adventure');
  const [chips, setChips] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [invited, setInvited] = useState<string[]>([]);
  const [notFound, setNotFound] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setChips([]);
    setText('');
    setInvited([]);
    setNotFound([]);
    setError('');
  }, [adventureId]);

  const usernames = text.trim() ? [...chips, text.trim()] : chips;

  const handleInvite = async () => {
    if (usernames.length === 0) return;
    setSubmitting(true);
    setError('');
    setNotFound([]);

    try {
      const res = await api.adventure.invite(adventureId, usernames, { silent: true });
      if (!res.ok) throw new Error(await extractApiError(res) ?? t('invite.errors.failed'));
      const data = await res.json();
      setInvited(data.invited ?? []);
      setNotFound(data.notFound ?? []);
      setChips([]);
      setText('');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('invite.errors.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border p-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('invite.title')}</span>

      <UsernameChipInput
        chips={chips}
        text={text}
        onChipsChange={setChips}
        onTextChange={setText}
        placeholder={t('invite.placeholder')}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {notFound.length > 0 && (
        <p className="text-sm text-destructive">{t('invite.notFound')}{notFound.join(', ')}</p>
      )}

      {invited.length > 0 && (
        <p className="text-sm text-muted-foreground">{t('invite.invited')}{invited.join(', ')}</p>
      )}

      <button
        type="button"
        onClick={handleInvite}
        disabled={submitting || usernames.length === 0}
        className="w-fit rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? t('invite.sending') : t('invite.action')}
      </button>
    </div>
  );
}
