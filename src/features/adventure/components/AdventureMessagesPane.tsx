import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdventureMessageBlock } from './AdventureMessageBlock';
import type { AdventureMessage } from '../types';

type AdventureMessagesPaneProps = {
  messages: AdventureMessage[];
  isGenerating: boolean;
  hasMore: boolean;
  isFetchingMore: boolean;
  onFetchMore: () => void;
};

export function AdventureMessagesPane({
  messages,
  isGenerating,
  hasMore,
  isFetchingMore,
  onFetchMore,
}: AdventureMessagesPaneProps) {
  const { t } = useTranslation('adventure');
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number | null>(null);
  const isPrependingRef = useRef(false);

  const phrases = t('page.generatingPhrases', { returnObjects: true }) as string[];
  const randomPhrase = () => phrases[Math.floor(Math.random() * phrases.length)];
  const [currentPhrase, setCurrentPhrase] = useState<string>(() => randomPhrase());

  // Scroll to bottom when new messages are appended
  useEffect(() => {
    if (isPrependingRef.current) return;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Preserve scroll position after prepending older messages
  useLayoutEffect(() => {
    if (prevScrollHeightRef.current === null) return;
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight - prevScrollHeightRef.current;
    }
    prevScrollHeightRef.current = null;
    isPrependingRef.current = false;
  }, [messages.length]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || !hasMore || isFetchingMore) return;
    if (el.scrollTop === 0) {
      prevScrollHeightRef.current = el.scrollHeight;
      isPrependingRef.current = true;
      onFetchMore();
    }
  };

  useEffect(() => {
    if (!isGenerating) return;
    setCurrentPhrase(randomPhrase());
    const interval = setInterval(() => {
      setCurrentPhrase(randomPhrase());
    }, 3000);
    return () => clearInterval(interval);
  }, [isGenerating, phrases]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        onScroll={handleScroll}
      >
        {isFetchingMore && (
          <div className="py-2 text-center text-xs text-muted-foreground">{t('page.loading')}</div>
        )}

        <div className="space-y-0.5">
          {messages.map((message) => (
            <AdventureMessageBlock key={message.id} message={message} />
          ))}
        </div>
      </div>

      {isGenerating && (
        <div className="px-4 py-2 flex items-center gap-2 text-sm text-red-500">
          <span className="animate-spin">⠋</span>
          <span>{currentPhrase}</span>
        </div>
      )}
    </div>
  );
}
