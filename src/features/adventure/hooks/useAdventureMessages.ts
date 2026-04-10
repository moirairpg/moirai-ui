import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../../../utils/api';
import type { AdventureMessage } from '../types';

type MessageSummary = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: string;
  creationDate: string;
};

type CursorResult<T> = {
  data: T[];
  hasMore: boolean;
};

type UseAdventureMessagesResult = {
  messages: AdventureMessage[];
  appendMessage: (message: AdventureMessage) => void;
  fetchMore: () => void;
  hasMore: boolean;
  isFetchingMore: boolean;
};

const saidPrefixRegex = /^.+? said[,:]?\s*"?/;

function stripSaidPrefix(content: string): string {
  return content.replace(saidPrefixRegex, '').replace(/"$/, '');
}

function toAdventureMessage(m: MessageSummary, personaName: string | undefined): AdventureMessage {
  return {
    id: m.id,
    role: m.role === 'user' ? 'user' : 'persona',
    content: stripSaidPrefix(m.content),
    personaName: m.role !== 'user' ? personaName : undefined,
  };
}

export function useAdventureMessages(
  adventureId: string,
  personaName: string | undefined,
): UseAdventureMessagesResult {
  const [messages, setMessages] = useState<AdventureMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const knownIds = useRef(new Set<string>());

  useEffect(() => {
    setMessages([]);
    setHasMore(false);
    knownIds.current = new Set();

    apiFetch(`/api/adventure/${adventureId}/messages?size=50`)
      .then((res) => res.json())
      .then((data: CursorResult<MessageSummary>) => {
        setHasMore(data.hasMore);
        const reversed = [...data.data].reverse();
        const mapped = reversed.map((m) => {
          knownIds.current.add(m.id);
          return toAdventureMessage(m, personaName);
        });
        setMessages(mapped);
      })
      .catch(() => {});
  }, [adventureId]);

  useEffect(() => {
    if (!personaName) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.role === 'persona' && !m.personaName ? { ...m, personaName } : m,
      ),
    );
  }, [personaName]);

  const fetchMore = useCallback(() => {
    if (isFetchingMore || messages.length === 0) return;
    const oldestId = messages[0].id;
    setIsFetchingMore(true);

    apiFetch(`/api/adventure/${adventureId}/messages?lastMessageId=${oldestId}&size=50`)
      .then((res) => res.json())
      .then((data: CursorResult<MessageSummary>) => {
        setHasMore(data.hasMore);
        const reversed = [...data.data].reverse();
        const newMessages = reversed
          .filter((m) => !knownIds.current.has(m.id))
          .map((m) => {
            knownIds.current.add(m.id);
            return toAdventureMessage(m, personaName);
          });
        setMessages((prev) => [...newMessages, ...prev]);
      })
      .catch(() => {})
      .finally(() => setIsFetchingMore(false));
  }, [adventureId, messages, isFetchingMore, personaName]);

  const appendMessage = useCallback((message: AdventureMessage) => {
    if (knownIds.current.has(message.id)) return;
    knownIds.current.add(message.id);
    setMessages((prev) => [...prev, message]);
  }, []);

  return {
    messages,
    appendMessage,
    fetchMore,
    hasMore,
    isFetchingMore,
  };
}
