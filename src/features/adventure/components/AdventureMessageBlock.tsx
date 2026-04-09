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

  const prefixClass =
    message.role === 'user' ? 'text-cyan-400' : 'text-green-400';
  const prefix =
    message.role === 'user' ? 'You' : (message.personaName ?? 'Persona');

  return (
    <div className="py-1 text-sm leading-relaxed">
      <span className={`font-mono font-medium ${prefixClass}`}>
        {prefix} ›
      </span>
      <span className="ml-2 whitespace-pre-wrap text-foreground">
        {message.content}
      </span>
    </div>
  );
}
