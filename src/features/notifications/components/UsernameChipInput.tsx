import { useRef } from 'react';
import type { KeyboardEvent } from 'react';

type UsernameChipInputProps = {
  chips: string[];
  text: string;
  onChipsChange: (chips: string[]) => void;
  onTextChange: (text: string) => void;
  invalid?: boolean;
  placeholder?: string;
};

export function UsernameChipInput({
  chips,
  text,
  onChipsChange,
  onTextChange,
  invalid = false,
  placeholder,
}: UsernameChipInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const commitChip = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (chips.includes(trimmed)) return;
    onChipsChange([...chips, trimmed]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      commitChip(text);
      onTextChange('');
      return;
    }

    if (e.key === 'Backspace' && text.length === 0 && chips.length > 0) {
      e.preventDefault();
      const last = chips[chips.length - 1];
      onChipsChange(chips.slice(0, -1));
      onTextChange(last);
    }
  };

  const handleBlur = () => {
    if (text.trim()) {
      commitChip(text);
      onTextChange('');
    }
  };

  const removeChip = (username: string) => {
    onChipsChange(chips.filter((c) => c !== username));
    inputRef.current?.focus();
  };

  const containerClass = `flex min-h-10 flex-wrap items-center gap-1 rounded border px-2 py-1 bg-background ${
    invalid ? 'border-red-500' : 'border-border'
  }`;

  return (
    <div
      className={containerClass}
      onClick={() => inputRef.current?.focus()}
      role="presentation"
    >
      {chips.map((chip) => (
        <span
          key={chip}
          className="flex items-center gap-1 rounded bg-accent/70 px-2 py-0.5 text-xs text-foreground"
        >
          {chip}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeChip(chip);
            }}
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Remove ${chip}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={chips.length === 0 ? placeholder : ''}
        className="min-w-[6rem] flex-1 bg-transparent text-sm outline-none"
      />
    </div>
  );
}
