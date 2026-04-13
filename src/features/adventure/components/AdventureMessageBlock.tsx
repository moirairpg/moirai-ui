import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import type { AdventureMessage } from '../types';

type AdventureMessageBlockProps = {
  message: AdventureMessage;
  isEditing?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
  onEditConfirm?: (newContent: string) => void;
  onEditCancel?: () => void;
};

export function AdventureMessageBlock({
  message,
  isEditing = false,
  onContextMenu,
  onEditConfirm,
  onEditCancel,
}: AdventureMessageBlockProps) {
  const [editValue, setEditValue] = useState(message.content);

  useEffect(() => {
    if (isEditing) {
      setEditValue(message.content);
    }
  }, [isEditing, message.content]);

  if (message.role === 'system') {
    return (
      <div className="py-0.5 font-mono text-xs text-muted-foreground/40">
        › {message.content}
      </div>
    );
  }

  if (isEditing && message.role !== 'system') {
    return (
      <div className="py-1">
        <textarea
          className="w-full resize-none rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          rows={3}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onEditConfirm?.(editValue);
            }
          }}
          autoFocus
        />
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={() => onEditConfirm?.(editValue)}
            className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={onEditCancel}
            className="rounded px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const prefixClass = message.role === 'user' ? 'text-cyan-400' : 'text-green-400';
  const prefix = message.role === 'user' ? 'You' : (message.narratorName ?? 'Narrator');

  return (
    <div
      className="py-1 text-sm leading-relaxed rounded px-1 -mx-1 hover:bg-muted/50 transition-colors"
      onContextMenu={onContextMenu}
    >
      <span className={`font-mono font-medium ${prefixClass}`}>{prefix} ›</span>
      <span className="ml-2 [overflow-wrap:anywhere]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            p: ({ children }) => <span className="text-foreground">{children}</span>,
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            em: ({ children }) => <em className="italic text-foreground">{children}</em>,
            ul: ({ children }) => <ul className="my-1 list-disc pl-5 text-foreground">{children}</ul>,
            ol: ({ children }) => <ol className="my-1 list-decimal pl-5 text-foreground">{children}</ol>,
            li: ({ children }) => <li className="my-0.5">{children}</li>,
            h1: ({ children }) => <span className="block text-base font-bold text-foreground">{children}</span>,
            h2: ({ children }) => <span className="block text-sm font-bold text-foreground">{children}</span>,
            h3: ({ children }) => <span className="block text-sm font-semibold text-foreground">{children}</span>,
            code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">{children}</code>,
            pre: ({ children }) => <pre className="my-1 overflow-x-auto rounded bg-muted p-2 font-mono text-xs text-foreground">{children}</pre>,
            blockquote: ({ children }) => <blockquote className="my-1 border-l-2 border-border pl-3 text-muted-foreground">{children}</blockquote>,
            hr: () => <hr className="my-2 border-border" />,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </span>
    </div>
  );
}
