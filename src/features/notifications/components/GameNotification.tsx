import { useEffect, useRef, useState } from 'react';
import { useGameNotificationsWebSocket } from '../hooks/useGameNotificationsWebSocket';

type VisibleGameNotification = {
  key: number;
  publicId: string;
  message: string;
};

type GameNotificationProps = {
  adventureId: string;
};

const AUTO_REMOVE_MS = 30000;

export function GameNotification({ adventureId }: GameNotificationProps) {
  const { latestGameNotification } = useGameNotificationsWebSocket(adventureId);
  const [visible, setVisible] = useState<VisibleGameNotification[]>([]);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    if (!latestGameNotification) return;

    const entry: VisibleGameNotification = {
      key: Date.now() + Math.random(),
      publicId: latestGameNotification.publicId,
      message: latestGameNotification.message,
    };

    setVisible((prev) => [...prev, entry]);

    const timer = setTimeout(() => {
      setVisible((prev) => prev.filter((v) => v.key !== entry.key));
      timersRef.current.delete(timer);
    }, AUTO_REMOVE_MS);
    timersRef.current.add(timer);
  }, [latestGameNotification]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  useEffect(() => {
    const onDeleted = (e: Event) => {
      const detail = (e as CustomEvent<{ publicId: string }>).detail;
      if (!detail?.publicId) return;
      setVisible((prev) => prev.filter((v) => v.publicId !== detail.publicId));
    };
    window.addEventListener('notification-deleted', onDeleted);
    return () => window.removeEventListener('notification-deleted', onDeleted);
  }, []);

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 px-4 py-2">
      {visible.map((n) => (
        <div
          key={n.key}
          className="rounded-md bg-accent/70 px-3 py-2 text-sm text-foreground shadow-sm"
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}
