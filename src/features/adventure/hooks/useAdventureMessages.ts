import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../../../utils/api';
import type { AdventureMessage } from '../types';

type AdventureData = {
  narratorName: string | null;
  adventureStart: string | null;
};

type MessageSummary = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: string;
  authorUsername: string | null;
  creationDate: string;
};

type CursorResult<T> = {
  data: T[];
  hasMore: boolean;
};

type UseAdventureMessagesResult = {
  messages: AdventureMessage[];
  narratorName: string | undefined;
  adventureStart: string | undefined;
  appendMessage: (message: AdventureMessage) => void;
  fetchMore: () => void;
  hasMore: boolean;
  isFetchingMore: boolean;
  removeMessage: (id: string) => void;
  removeMessagesFromIdForward: (id: string) => void;
  removeMessagesFromIdInclusive: (id: string) => void;
};

const saidPrefixRegex = /^.+? said[,:]?\s*"?/;

function stripSaidPrefix(content: string): string {
  return content.replace(saidPrefixRegex, '').replace(/"$/, '');
}

function toAdventureMessage(m: MessageSummary, narratorName: string | undefined): AdventureMessage {
  return {
    id: m.id,
    role: m.role === 'user' ? 'user' : 'narrator',
    content: stripSaidPrefix(m.content),
    narratorName: m.role !== 'user' ? narratorName : undefined,
    authorUsername: m.authorUsername ?? undefined,
  };
}

export function useAdventureMessages(adventureId: string): UseAdventureMessagesResult {
  const [narratorName, setNarratorName] = useState<string | undefined>(undefined);
  const [adventureStart, setAdventureStart] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<AdventureMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const knownIds = useRef(new Set<string>());
  const narratorNameRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    setMessages([]);
    setHasMore(false);
    setNarratorName(undefined);
    setAdventureStart(undefined);
    knownIds.current = new Set();

    apiFetch(`/api/adventure/${adventureId}`)
      .then((res) => res.json())
      .then((adv: AdventureData) => {
        const name = adv.narratorName ?? undefined;
        const start = adv.adventureStart ?? undefined;
        setNarratorName(name);
        setAdventureStart(start);
        narratorNameRef.current = name;

        return apiFetch(`/api/adventure/${adventureId}/messages?size=50`)
          .then((res) => res.json())
          .then((data: CursorResult<MessageSummary>) => {
            setHasMore(data.hasMore);
            const reversed = [...data.data].reverse();
            const mapped = reversed.map((m) => {
              knownIds.current.add(m.id);
              return toAdventureMessage(m, name);
            });
            setMessages(mapped);
          });
      })
      .catch(() => {});
  }, [adventureId]);

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
            return toAdventureMessage(m, narratorNameRef.current);
          });
        setMessages((prev) => [...newMessages, ...prev]);
      })
      .catch(() => {})
      .finally(() => setIsFetchingMore(false));
  }, [adventureId, messages, isFetchingMore]);

  const appendMessage = useCallback((message: AdventureMessage) => {
    if (knownIds.current.has(message.id)) return;
    knownIds.current.add(message.id);
    setMessages((prev) => [...prev, message]);
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    knownIds.current.delete(id);
  }, []);

  const removeMessagesFromIdForward = useCallback((id: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);

      if (idx === -1) return prev;

      prev.slice(idx).forEach((m) => knownIds.current.delete(m.id));
      return prev.slice(0, idx);
    });
  }, []);

  const removeMessagesFromIdInclusive = useCallback((id: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);

      if (idx === -1) return prev;

      prev.slice(idx).forEach((m) => knownIds.current.delete(m.id));
      return prev.slice(0, idx);
    });
  }, []);

  return {
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
  };
}
