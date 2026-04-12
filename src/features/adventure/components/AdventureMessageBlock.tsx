import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AdventureMessage } from '../types';

type AdventureMessageBlockProps = {
  message: AdventureMessage;
};

export function AdventureMessageBlock({ message }: AdventureMessageBlockProps) {
  if (message.role === 'system') {
    return (
      <div className="py-0.5 font-mono text-xs text-muted-foreground/40">
        › {message.content}
      </div>
    );
  }

  const prefixClass = message.role === 'user' ? 'text-cyan-400' : 'text-green-400';
  const prefix = message.role === 'user' ? 'You' : (message.narratorName ?? 'Narrator');

  return (
    <div className="py-1 text-sm leading-relaxed rounded px-1 -mx-1 hover:bg-muted/50 transition-colors">
      <span className={`font-mono font-medium ${prefixClass}`}>{prefix} ›</span>
      <span className="ml-2 [overflow-wrap:anywhere]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
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
