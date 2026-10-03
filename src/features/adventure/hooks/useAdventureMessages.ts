import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch, apiPath } from '../../../utils/api';
import type { AdventureMessage } from '../types';
import type { AdventureMembershipSummary, ContextAttributes } from '../../sidebar/types';

const EMPTY_CONTEXT_ATTRIBUTES: ContextAttributes = {
  nudge: '',
  authorsNote: '',
  scene: '',
  bump: '',
  bumpFrequency: 0,
};

type AdventureData = {
  name: string | null;
  narratorName: string | null;
  adventureStart: string | null;
  roster: AdventureMembershipSummary[] | null;
  canManage: boolean | null;
  contextAttributes: {
    nudge: string | null;
    authorsNote: string | null;
    scene: string | null;
    bump: string | null;
    bumpFrequency: number | null;
  } | null;
};

type MessageSummary = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: string;
  authorId: string | null;
  authorCharacterName: string | null;
  creationDate: string;
};

type CursorResult<T> = {
  data: T[];
  hasMore: boolean;
};

type UseAdventureMessagesResult = {
  messages: AdventureMessage[];
  loadError: boolean;
  adventureName: string | undefined;
  narratorName: string | undefined;
  roster: AdventureMembershipSummary[];
  canManage: boolean;
  contextAttributes: ContextAttributes;
  updateContextAttributes: (patch: Partial<ContextAttributes>) => void;
  appendMessage: (message: AdventureMessage) => void;
  fetchMore: () => void;
  hasMore: boolean;
  isFetchingMore: boolean;
  removeMessage: (id: string) => void;
  removeMessagesFromIdInclusive: (id: string) => void;
  removeMessagesAfterId: (id: string) => void;
  replaceMessageContent: (id: string, content: string) => void;
};

function toAdventureMessage(m: MessageSummary): AdventureMessage {
  return {
    id: m.id,
    role: m.role === 'user' ? 'user' : 'narrator',
    content: m.content,
    authorName: m.authorCharacterName ?? undefined,
    authorId: m.authorId ?? undefined,
  };
}

export function useAdventureMessages(adventureId: string): UseAdventureMessagesResult {
  const [adventureName, setAdventureName] = useState<string | undefined>(undefined);
  const [narratorName, setNarratorName] = useState<string | undefined>(undefined);
  const [roster, setRoster] = useState<AdventureMembershipSummary[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [contextAttributes, setContextAttributes] = useState<ContextAttributes>(EMPTY_CONTEXT_ATTRIBUTES);
  const [messages, setMessages] = useState<AdventureMessage[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const knownIds = useRef(new Set<string>());

  useEffect(() => {
    setMessages([]);
    setHasMore(false);
    setAdventureName(undefined);
    setNarratorName(undefined);
    setRoster([]);
    setCanManage(false);
    setContextAttributes(EMPTY_CONTEXT_ATTRIBUTES);
    setLoadError(false);
    knownIds.current = new Set();

    apiFetch(apiPath`/api/adventures/${adventureId}`, { silent: true })
      .then((res) => {
        if (!res.ok) throw new Error('Adventure not accessible');
        return res.json();
      })
      .then((adv: AdventureData) => {
        const name = adv.narratorName ?? undefined;
        setAdventureName(adv.name ?? undefined);
        setNarratorName(name);
        setRoster(adv.roster ?? []);
        setCanManage(adv.canManage ?? false);
        setContextAttributes({
          nudge: adv.contextAttributes?.nudge ?? '',
          authorsNote: adv.contextAttributes?.authorsNote ?? '',
          scene: adv.contextAttributes?.scene ?? '',
          bump: adv.contextAttributes?.bump ?? '',
          bumpFrequency: adv.contextAttributes?.bumpFrequency ?? 0,
        });

        return apiFetch(apiPath`/api/adventures/${adventureId}/messages?size=50`)
          .then((res) => res.json())
          .then((data: CursorResult<MessageSummary>) => {
            setHasMore(data.hasMore);
            const reversed = [...data.data].reverse();
            const mapped = reversed.map((m) => {
              knownIds.current.add(m.id);
              return toAdventureMessage(m);
            });
            setMessages(mapped);
          });
      })
      .catch(() => setLoadError(true));
  }, [adventureId]);

  const fetchMore = useCallback(() => {
    if (isFetchingMore || messages.length === 0) return;
    const oldestId = messages[0].id;
    setIsFetchingMore(true);

    apiFetch(apiPath`/api/adventures/${adventureId}/messages?lastMessageId=${oldestId}&size=50`)
      .then((res) => res.json())
      .then((data: CursorResult<MessageSummary>) => {
        setHasMore(data.hasMore);
        const reversed = [...data.data].reverse();
        const newMessages = reversed
          .filter((m) => !knownIds.current.has(m.id))
          .map((m) => {
            knownIds.current.add(m.id);
            return toAdventureMessage(m);
          });
        setMessages((prev) => [...newMessages, ...prev]);
      })
      .catch(() => {})
      .finally(() => setIsFetchingMore(false));
  }, [adventureId, messages, isFetchingMore]);

  const updateContextAttributes = useCallback((patch: Partial<ContextAttributes>) => {
    setContextAttributes((prev) => ({ ...prev, ...patch }));
  }, []);

  const appendMessage = useCallback((message: AdventureMessage) => {
    if (knownIds.current.has(message.id)) return;
    knownIds.current.add(message.id);
    setMessages((prev) => [...prev, message]);
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id && m.relatedMessageId !== id));
    knownIds.current.delete(id);
  }, []);

  const removeMessagesFromIdInclusive = useCallback((id: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);

      if (idx === -1) return prev;

      prev.slice(idx).forEach((m) => knownIds.current.delete(m.id));
      return prev.slice(0, idx);
    });
  }, []);

  const removeMessagesAfterId = useCallback((id: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);

      if (idx === -1) return prev;

      prev.slice(idx + 1).forEach((m) => knownIds.current.delete(m.id));
      return prev.slice(0, idx + 1);
    });
  }, []);

  const replaceMessageContent = useCallback((id: string, content: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content } : m)));
  }, []);

  return {
    messages,
    loadError,
    adventureName,
    narratorName,
    roster,
    canManage,
    contextAttributes,
    updateContextAttributes,
    appendMessage,
    fetchMore,
    hasMore,
    isFetchingMore,
    removeMessage,
    removeMessagesFromIdInclusive,
    removeMessagesAfterId,
    replaceMessageContent,
  };
}
