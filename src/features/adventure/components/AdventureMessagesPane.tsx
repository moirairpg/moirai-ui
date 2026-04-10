import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AdventureMessageBlock } from './AdventureMessageBlock';
import { generatingPhrases } from '../constants/generatingPhrases';
import type { AdventureMessage } from '../types';

type AdventureMessagesPaneProps = {
  messages: AdventureMessage[];
  isGenerating: boolean;
  hasMore: boolean;
  isFetchingMore: boolean;
  onFetchMore: () => void;
};

function randomPhrase(): string {
  return generatingPhrases[Math.floor(Math.random() * generatingPhrases.length)];
}

export function AdventureMessagesPane({
  messages,
  isGenerating,
  hasMore,
  isFetchingMore,
  onFetchMore,
}: AdventureMessagesPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number | null>(null);
  const isPrependingRef = useRef(false);
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
  }, [isGenerating]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-4"
      onScroll={handleScroll}
    >
      {isFetchingMore && (
        <div className="py-2 text-center text-xs text-muted-foreground">Loading...</div>
      )}

      <div className="space-y-0.5">
        {messages.map((message) => (
          <AdventureMessageBlock key={message.id} message={message} />
        ))}
      </div>

      {isGenerating && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-500">
          <span className="animate-spin">⠋</span>
          <span>{currentPhrase}</span>
        </div>
      )}
    </div>
  );
}
