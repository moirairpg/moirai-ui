import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Bold, Italic, Strikethrough } from 'lucide-react';
import { AdventureMessagesPane } from './AdventureMessagesPane';
import { useAdventureMessages } from '../hooks/useAdventureMessages';
import { useAdventureWebSocket } from '../hooks/useAdventureWebSocket';
import { apiFetch } from '../../../utils/api';
import type { AdventureMessage } from '../types';

type AdventurePageProps = {
  adventureId: string;
};

const saidPrefixRegex = /^.+? said[,:]?\s*"?/;

function stripSaidPrefix(content: string): string {
  return content.replace(saidPrefixRegex, '').replace(/"$/, '');
}

type FormatButton = {
  icon: typeof Bold;
  marker: string;
  titleKey: string;
};

const FORMAT_BUTTONS: FormatButton[] = [
  { icon: Bold, marker: '**', titleKey: 'page.formatting.bold' },
  { icon: Italic, marker: '*', titleKey: 'page.formatting.italic' },
  { icon: Strikethrough, marker: '~~', titleKey: 'page.formatting.strikethrough' },
];

function applyFormat(
  textarea: HTMLTextAreaElement,
  marker: string,
  value: string,
  onChange: (v: string) => void,
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);

  let newValue: string;
  let cursorStart: number;
  let cursorEnd: number;

  if (selected) {
    newValue = value.slice(0, start) + marker + selected + marker + value.slice(end);
    cursorStart = start + marker.length;
    cursorEnd = end + marker.length;
  } else {
    newValue = value.slice(0, start) + marker + marker + value.slice(start);
    cursorStart = start + marker.length;
    cursorEnd = cursorStart;
  }

  onChange(newValue);
  requestAnimationFrame(() => {
    textarea.selectionStart = cursorStart;
    textarea.selectionEnd = cursorEnd;
    textarea.focus();
  });
}

export default function AdventurePage({ adventureId }: AdventurePageProps) {
  const { t } = useTranslation('adventure');
  const [narratorName, setNarratorName] = useState<string | undefined>(undefined);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setNarratorName(undefined);
    apiFetch(`/api/adventure/${adventureId}`)
      .then((res) => res.json())
      .then((adv: { narratorName: string | null }) => setNarratorName(adv.narratorName ?? undefined))
      .catch(() => {});
    textareaRef.current?.focus();
  }, [adventureId]);

  useEffect(() => {
    if (!isGenerating) textareaRef.current?.focus();
  }, [isGenerating]);

  useEffect(() => {
    const onFocus = () => { if (!textareaRef.current?.disabled) textareaRef.current?.focus(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  const { messages, appendMessage, fetchMore, hasMore, isFetchingMore } = useAdventureMessages(adventureId, narratorName);
  const { sendMessage, lastMessage } = useAdventureWebSocket(adventureId);

  useEffect(() => {
    if (!lastMessage) return;
    const isUser = lastMessage.role === 'USER';
    const msg: AdventureMessage = {
      id: lastMessage.id,
      role: isUser ? 'user' : 'narrator',
      content: stripSaidPrefix(lastMessage.content),
      narratorName: !isUser ? narratorName : undefined,
    };
    appendMessage(msg);
    setIsGenerating(false);
  }, [lastMessage, appendMessage, narratorName]);

  const submit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    setInput('');
    setIsGenerating(true);
    appendMessage({ id: crypto.randomUUID(), role: 'user', content: trimmed });
    sendMessage(trimmed);
  }, [input, isGenerating, appendMessage, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleFormat = (marker: string) => {
    if (!textareaRef.current) return;
    applyFormat(textareaRef.current, marker, input, setInput);
  };

  return (
    <div className="flex h-full flex-col">
      <AdventureMessagesPane
        messages={messages}
        isGenerating={isGenerating}
        hasMore={hasMore}
        isFetchingMore={isFetchingMore}
        onFetchMore={fetchMore}
      />

      <div className="border-t border-border/50 p-4">
        <div className="flex gap-1 mb-1.5">
          {FORMAT_BUTTONS.map(({ icon: Icon, marker, titleKey }) => (
            <button
              key={marker}
              type="button"
              title={t(titleKey)}
              onMouseDown={(e) => { e.preventDefault(); handleFormat(marker); }}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            style={{ minHeight: '2.25rem', maxHeight: '8rem', overflowY: 'auto' }}
            placeholder={t('page.inputPlaceholder')}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
            }}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !input.trim()}
            className="self-end rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {t('page.send')}
          </button>
        </form>
      </div>
    </div>
  );
}
