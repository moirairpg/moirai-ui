import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Bold, Italic, Strikethrough } from 'lucide-react';
import { AdventureMessagesPane } from './AdventureMessagesPane';
import { AdventureMessageContextMenu } from './AdventureMessageContextMenu';
import { CommandPicker } from './CommandPicker';
import { useAdventureMessages } from '../hooks/useAdventureMessages';
import { useAdventureWebSocket } from '../hooks/useAdventureWebSocket';
import { useAdventureCommands } from '../hooks/useAdventureCommands';
import { apiFetch } from '../../../utils/api';
import { useAuth } from '../../../components/auth/context/AuthContext';
import type { AdventureMessage } from '../types';
import type { CommandDefinition } from '../commands/types';

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

type ContextMenuState = {
  x: number;
  y: number;
  messageId: string;
  canEdit: boolean;
  canRetry: boolean;
} | null;

export default function AdventurePage({ adventureId }: AdventurePageProps) {
  const { t } = useTranslation('adventure');
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
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

  useEffect(() => {
    setPickerOpen(input.startsWith('/'));
  }, [input]);

  const {
    messages,
    narratorName,
    adventureStart,
    appendMessage,
    fetchMore,
    hasMore,
    isFetchingMore,
    removeMessage,
    removeMessagesFromIdForward,
    removeMessagesFromIdInclusive,
  } = useAdventureMessages(adventureId);

  const { sendMessage, lastMessage } = useAdventureWebSocket(adventureId);
  const { handleInput } = useAdventureCommands(adventureId, adventureStart, narratorName, messages, removeMessage);

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
    setPickerOpen(false);

    const handled = handleInput(trimmed, sendMessage, appendMessage, setIsGenerating);

    if (handled) return;

    setIsGenerating(true);
    appendMessage({ id: crypto.randomUUID(), role: 'user', content: trimmed, authorUsername: user?.username });
    sendMessage(trimmed);
  }, [input, isGenerating, appendMessage, sendMessage, handleInput]);

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

  const handleCommandSelect = (cmd: CommandDefinition) => {
    setInput(`/${cmd.name}${cmd.args.length > 0 ? ' ' : ''}`);
    setPickerOpen(false);
    textareaRef.current?.focus();
  };

  const handleContextMenu = (e: React.MouseEvent, message: AdventureMessage) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId: message.id,
      canEdit: message.authorUsername === user?.username,
      canRetry: message.role === 'narrator',
    });
  };

  const handleContextAction = (action: 'edit' | 'retry' | 'delete', messageId: string) => {
    if (action === 'edit') {
      setEditingMessageId(messageId);
      return;
    }

    if (action === 'delete') {
      apiFetch(`/api/adventure/${adventureId}/message/${messageId}`, { method: 'DELETE' })
        .then(() => removeMessage(messageId))
        .catch(() => {});
      return;
    }

    if (action === 'retry') {
      setIsGenerating(true);
      apiFetch(`/api/adventure/${adventureId}/message/${messageId}/retry`, { method: 'POST' })
        .then((res) => res.json())
        .then((result: { id: string; role: string; content: string }) => {
          removeMessagesFromIdForward(messageId);
          appendMessage({ id: result.id, role: 'narrator', content: result.content, narratorName });
          setIsGenerating(false);
        })
        .catch(() => setIsGenerating(false));
    }
  };

  const handleEditConfirm = (messageId: string, newContent: string) => {
    apiFetch(`/api/adventure/${adventureId}/message/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent }),
    })
      .then(() => {
        removeMessagesFromIdInclusive(messageId);
        setEditingMessageId(null);
        setIsGenerating(true);
        appendMessage({ id: messageId, role: 'user', content: newContent, authorUsername: user?.username });
        return apiFetch(`/api/adventure/${adventureId}/go`, { method: 'POST' });
      })
      .then((res) => res.json())
      .then((result: { id: string; content: string }) => {
        appendMessage({ id: result.id, role: 'narrator', content: result.content, narratorName });
        setIsGenerating(false);
      })
      .catch(() => setIsGenerating(false));
  };

  return (
    <div className="flex h-full flex-col">
      <AdventureMessagesPane
        messages={messages}
        isGenerating={isGenerating}
        hasMore={hasMore}
        isFetchingMore={isFetchingMore}
        onFetchMore={fetchMore}
        editingMessageId={editingMessageId}
        onContextMenu={handleContextMenu}
        onEditConfirm={handleEditConfirm}
        onEditCancel={() => setEditingMessageId(null)}
      />

      {contextMenu &&
        createPortal(
          <AdventureMessageContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            canEdit={contextMenu.canEdit}
            canRetry={contextMenu.canRetry}
            onAction={(action) => handleContextAction(action, contextMenu.messageId)}
            onDismiss={() => setContextMenu(null)}
          />,
          document.body,
        )}

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

        {pickerOpen && (
          <CommandPicker
            input={input}
            onSelect={handleCommandSelect}
            onDismiss={() => setPickerOpen(false)}
          />
        )}

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
