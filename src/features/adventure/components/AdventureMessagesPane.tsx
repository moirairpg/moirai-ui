import { useEffect, useRef, useState } from 'react';
import { AdventureMessageBlock } from './AdventureMessageBlock';
import { generatingPhrases } from '../constants/generatingPhrases';
import type { AdventureMessage } from '../types';

type AdventureMessagesPaneProps = {
  messages: AdventureMessage[];
  isGenerating: boolean;
};

function randomPhrase(): string {
  return generatingPhrases[Math.floor(Math.random() * generatingPhrases.length)];
}

export function AdventureMessagesPane({
  messages,
  isGenerating,
}: AdventureMessagesPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentPhrase, setCurrentPhrase] = useState<string>(() => randomPhrase());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

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
    >
      <div className="space-y-0.5">
        {messages.map((message) => (
          <AdventureMessageBlock
            key={message.id}
            message={message}
          />
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
