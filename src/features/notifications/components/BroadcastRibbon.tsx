import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBroadcastWebSocket } from '../hooks/useBroadcastWebSocket';
import { useReadNotification } from '../hooks/useReadNotification';

export function BroadcastRibbon() {
  const { t } = useTranslation('notifications');
  const { broadcasts } = useBroadcastWebSocket();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { mutate: markRead } = useReadNotification();

  const handleDismiss = (publicId: string) => {
    void markRead(publicId);
    setDismissed((prev) => new Set(prev).add(publicId));
  };

  const visible = broadcasts.filter((b) => !dismissed.has(b.publicId));

  if (visible.length === 0) return null;

  return (
    <div>
      {visible.map((b) => {
        const isUrgent = b.level === 'URGENT';
        const ribbonClass = isUrgent
          ? 'bg-red-600 text-white'
          : 'bg-green-600 text-white';

        return (
          <div
            key={b.publicId}
            className={`relative flex items-center justify-center px-4 py-2 text-sm font-medium ${ribbonClass}`}
          >
            <span className="text-center">{b.message}</span>
            {!isUrgent && (
              <button
                onClick={() => handleDismiss(b.publicId)}
                className="absolute right-4 underline"
                type="button"
              >
                {t('broadcastRibbon.dismiss')}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
