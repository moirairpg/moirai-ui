import { useCallback } from 'react';
import { apiFetch } from '../../../utils/api';
import { parseCommand } from '../commands/parser';
import type { AdventureMessage } from '../types';
import type { ParsedCommand } from '../commands/types';

type UseAdventureCommandsResult = {
  handleInput: (
    input: string,
    sendMessage: (content: string) => void,
    appendMessage: (msg: AdventureMessage) => void,
    setIsGenerating: (v: boolean) => void,
  ) => boolean;
};

export function useAdventureCommands(
  adventureId: string,
  adventureStart: string | undefined,
  narratorName: string | undefined,
  messages: AdventureMessage[],
  removeMessage: (id: string) => void,
): UseAdventureCommandsResult {
  const handleInput = useCallback(
    (
      input: string,
      sendMessage: (content: string) => void,
      appendMessage: (msg: AdventureMessage) => void,
      setIsGenerating: (v: boolean) => void,
    ): boolean => {
      if (!input.startsWith('/')) return false;

      const parsed = parseCommand(input);

      if (!parsed) {
        appendMessage(systemMessage('Missing required argument.'));
        return true;
      }

      if (parsed.name === 'unknown') {
        appendMessage(systemMessage(`Unknown command: /${parsed.raw}`));
        return true;
      }

      if (parsed.name === 'missing-arg') {
        appendMessage(systemMessage(`/${parsed.commandName} requires <${parsed.argName}> — ${parsed.argDescription}`));
        return true;
      }

      if (parsed.name === 'invalid-arg') {
        appendMessage(systemMessage(`/${parsed.commandName}: <${parsed.argName}> ${parsed.message}`));
        return true;
      }

      dispatchCommand(parsed, adventureId, adventureStart, narratorName, messages, removeMessage, sendMessage, appendMessage, setIsGenerating);
      return true;
    },
    [adventureId, adventureStart, narratorName, messages, removeMessage],
  );

  return { handleInput };
}

function systemMessage(content: string): AdventureMessage {
  return { id: crypto.randomUUID(), role: 'system', content };
}

function dispatchCommand(
  command: ParsedCommand,
  adventureId: string,
  adventureStart: string | undefined,
  narratorName: string | undefined,
  messages: AdventureMessage[],
  removeMessage: (id: string) => void,
  sendMessage: (content: string) => void,
  appendMessage: (msg: AdventureMessage) => void,
  setIsGenerating: (v: boolean) => void,
) {
  switch (command.name) {
    case 'start':
      if (adventureStart) {
        appendMessage({ id: crypto.randomUUID(), role: 'narrator', content: adventureStart, narratorName });
      }
      setIsGenerating(true);
      apiFetch(`/api/adventure/${adventureId}/start`, { method: 'POST' })
        .then((res) => res.json())
        .then((result: { id: string; content: string; role: string }) => {
          appendMessage({ id: result.id, role: 'narrator', content: result.content, narratorName });
          setIsGenerating(false);
        })
        .catch(() => {
          setIsGenerating(false);
          appendMessage(systemMessage('Failed to start adventure.'));
        });
      break;

    case 'go':
      setIsGenerating(true);
      apiFetch(`/api/adventure/${adventureId}/go`, { method: 'POST' })
        .then((res) => res.json())
        .then((result: { id: string; content: string; role: string }) => {
          appendMessage({ id: result.id, role: 'narrator', content: result.content, narratorName });
          setIsGenerating(false);
        })
        .catch(() => {
          setIsGenerating(false);
          appendMessage(systemMessage('Failed to advance story.'));
        });
      break;

    case 'retry': {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== 'narrator') {
        appendMessage(systemMessage('/retry can only be used after an AI response.'));
        break;
      }
      removeMessage(lastMessage.id);
      setIsGenerating(true);
      apiFetch(`/api/adventure/${adventureId}/retry`, { method: 'POST' })
        .then((res) => res.json())
        .then((result: { id: string; content: string; role: string }) => {
          appendMessage({ id: result.id, role: 'narrator', content: result.content, narratorName });
          setIsGenerating(false);
        })
        .catch(() => {
          setIsGenerating(false);
          appendMessage(systemMessage('Failed to retry.'));
        });
      break;
    }

    case 'say':
      apiFetch(`/api/adventure/${adventureId}/say`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: command.text }),
      })
        .then((res) => res.json())
        .then((result: { id: string; content: string; role: string }) => {
          appendMessage({ id: result.id, role: 'narrator', content: result.content, narratorName });
        })
        .catch(() => appendMessage(systemMessage('Failed to insert dialogue.')));
      break;

    case 'nudge':
      apiFetch(`/api/adventure/${adventureId}/nudge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nudge: command.text }),
      })
        .then(() => appendMessage(systemMessage('Nudge updated.')))
        .catch(() => appendMessage(systemMessage('Failed to update nudge.')));
      break;

    case 'authors-note':
      apiFetch(`/api/adventure/${adventureId}/authors-note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorsNote: command.text }),
      })
        .then(() => appendMessage(systemMessage("Author's note updated.")))
        .catch(() => appendMessage(systemMessage("Failed to update author's note.")));
      break;

    case 'scene':
      apiFetch(`/api/adventure/${adventureId}/scene`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scene: command.text }),
      })
        .then(() => appendMessage(systemMessage('Scene updated.')))
        .catch(() => appendMessage(systemMessage('Failed to update scene.')));
      break;

    case 'bump':
      apiFetch(`/api/adventure/${adventureId}/bump`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bump: command.text, bumpFrequency: command.frequency }),
      })
        .then(() => appendMessage(systemMessage(`Bump updated (every ${command.frequency} messages).`)))
        .catch(() => appendMessage(systemMessage('Failed to update bump.')));
      break;
  }
}
