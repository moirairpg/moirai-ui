import { useState, useEffect } from 'react';
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

export default function AdventurePage({ adventureId }: AdventurePageProps) {
  const [personaName, setPersonaName] = useState<string | undefined>(undefined);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setPersonaName(undefined);
    apiFetch(`/api/adventure/${adventureId}`)
      .then((res) => res.json())
      .then((adv: { personaId: string }) =>
        apiFetch(`/api/persona/${adv.personaId}`).then((res) => res.json()),
      )
      .then((persona: { name: string }) => setPersonaName(persona.name))
      .catch(() => {});
  }, [adventureId]);

  const { messages, appendMessage, fetchMore, hasMore, isFetchingMore } = useAdventureMessages(adventureId, personaName);
  const { sendMessage, lastMessage } = useAdventureWebSocket(adventureId);

  useEffect(() => {
    if (!lastMessage) return;
    const isUser = lastMessage.role === 'USER';
    const msg: AdventureMessage = {
      id: lastMessage.id,
      role: isUser ? 'user' : 'persona',
      content: stripSaidPrefix(lastMessage.content),
      personaName: !isUser ? personaName : undefined,
    };
    appendMessage(msg);
    setIsGenerating(false);
  }, [lastMessage, appendMessage, personaName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    setInput('');
    setIsGenerating(true);
    appendMessage({ id: crypto.randomUUID(), role: 'user', content: trimmed });
    sendMessage(trimmed);
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

      <form onSubmit={handleSubmit} className="border-t border-border/50 p-4">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="What do you do?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !input.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
