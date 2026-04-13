import { useEffect, useState } from 'react';
import { matchesPrefix } from '../commands/parser';
import type { CommandDefinition } from '../commands/types';

type CommandPickerProps = {
  input: string;
  onSelect: (command: CommandDefinition) => void;
  onDismiss: () => void;
};

export function CommandPicker({ input, onSelect, onDismiss }: CommandPickerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const matches = matchesPrefix(input);

  useEffect(() => {
    setActiveIndex(0);
  }, [input]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (matches.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => (i + 1) % matches.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => (i - 1 + matches.length) % matches.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        onSelect(matches[activeIndex]);
      } else if (e.key === 'Escape') {
        e.stopPropagation();
        onDismiss();
      }
    };

    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [matches, activeIndex, onSelect, onDismiss]);

  if (matches.length === 0) return null;

  return (
    <div className="mb-1 rounded-md border border-border bg-popover shadow-md">
      {matches.map((cmd, i) => (
        <button
          key={cmd.name}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onSelect(cmd); }}
          className={`flex w-full items-center gap-3 px-3 py-1.5 text-left text-sm ${
            i === activeIndex ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/50'
          }`}
        >
          <span className="font-mono text-primary">
            /{cmd.name}
            {cmd.args.map((arg) => (
              <span key={arg.name} className="text-muted-foreground"> {arg.name}:{arg.type}</span>
            ))}
          </span>
          <span className="text-muted-foreground">{cmd.description}</span>
        </button>
      ))}
    </div>
  );
}
