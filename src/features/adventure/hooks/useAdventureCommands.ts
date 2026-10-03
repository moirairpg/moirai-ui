import { useCallback } from 'react';
import { apiFetch, apiPath, extractApiError } from '../../../utils/api';
import { parseCommand } from '../commands/parser';
import type { AdventureMessage } from '../types';
import type { ParsedCommand } from '../commands/types';
import type { ContextAttributes } from '../../sidebar/types';

type ContextUpdate = {
  path: string;
  body: Record<string, unknown>;
  patch: Partial<ContextAttributes>;
  successMessage: string;
  failureMessage: string;
};

export type AdventureActions = {
  startAdventure: () => void;
  go: () => void;
  retry: () => void;
  say: (content: string) => void;
};

type UseAdventureCommandsResult = {
  handleInput: (
    input: string,
    appendMessage: (msg: AdventureMessage) => void,
    setIsGenerating: (v: boolean) => void,
  ) => boolean;
  handleParsedCommand: (
    command: ParsedCommand,
    appendMessage: (msg: AdventureMessage) => void,
    setIsGenerating: (v: boolean) => void,
  ) => void;
};

export function useAdventureCommands(
  adventureId: string,
  messages: AdventureMessage[],
  actions: AdventureActions,
  onContextUpdated: (patch: Partial<ContextAttributes>) => void,
): UseAdventureCommandsResult {
  const handleInput = useCallback(
    (
      input: string,
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

      dispatchCommand(parsed, adventureId, messages, actions, appendMessage, setIsGenerating, onContextUpdated);
      return true;
    },
    [adventureId, messages, actions, onContextUpdated],
  );

  const handleParsedCommand = useCallback(
    (
      command: ParsedCommand,
      appendMessage: (msg: AdventureMessage) => void,
      setIsGenerating: (v: boolean) => void,
    ) => {
      dispatchCommand(command, adventureId, messages, actions, appendMessage, setIsGenerating, onContextUpdated);
    },
    [adventureId, messages, actions, onContextUpdated],
  );

  return { handleInput, handleParsedCommand };
}

function systemMessage(content: string): AdventureMessage {
  return { id: crypto.randomUUID(), role: 'system', content };
}

function dispatchCommand(
  command: ParsedCommand,
  adventureId: string,
  messages: AdventureMessage[],
  actions: AdventureActions,
  appendMessage: (msg: AdventureMessage) => void,
  setIsGenerating: (v: boolean) => void,
  onContextUpdated: (patch: Partial<ContextAttributes>) => void,
) {
  switch (command.name) {
    case 'start':
      setIsGenerating(true);
      actions.startAdventure();
      break;

    case 'go':
      setIsGenerating(true);
      actions.go();
      break;

    case 'retry': {
      const lastMessage = messages[messages.length - 1];

      if (!lastMessage || lastMessage.role !== 'narrator') {
        appendMessage(systemMessage('/retry can only be used after an AI response.'));
        break;
      }

      setIsGenerating(true);
      actions.retry();
      break;
    }

    case 'say':
      actions.say(command.text);
      break;

    case 'nudge':
      applyContextUpdate({
        path: 'nudge',
        body: { nudge: command.text },
        patch: { nudge: command.text },
        successMessage: 'Nudge updated.',
        failureMessage: 'Failed to update nudge.',
      }, adventureId, appendMessage, onContextUpdated);
      break;

    case 'authors-note':
      applyContextUpdate({
        path: 'authors-note',
        body: { authorsNote: command.text },
        patch: { authorsNote: command.text },
        successMessage: "Author's note updated.",
        failureMessage: "Failed to update author's note.",
      }, adventureId, appendMessage, onContextUpdated);
      break;

    case 'scene':
      applyContextUpdate({
        path: 'scene',
        body: { scene: command.text },
        patch: { scene: command.text },
        successMessage: 'Scene updated.',
        failureMessage: 'Failed to update scene.',
      }, adventureId, appendMessage, onContextUpdated);
      break;

    case 'bump':
      applyContextUpdate({
        path: 'bump',
        body: { bump: command.text, bumpFrequency: command.frequency },
        patch: { bump: command.text, bumpFrequency: command.frequency },
        successMessage: `Bump updated (every ${command.frequency} messages).`,
        failureMessage: 'Failed to update bump.',
      }, adventureId, appendMessage, onContextUpdated);
      break;
  }
}

function applyContextUpdate(
  update: ContextUpdate,
  adventureId: string,
  appendMessage: (msg: AdventureMessage) => void,
  onContextUpdated: (patch: Partial<ContextAttributes>) => void,
) {
  apiFetch(apiPath`/api/adventures/${adventureId}/${update.path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update.body),
    silent: true,
  })
    .then(async (res: Response) => {
      if (!res.ok) {
        const detail = await extractApiError(res);
        appendMessage(systemMessage(detail ? `${update.failureMessage} ${detail}` : update.failureMessage));
        return;
      }

      onContextUpdated(update.patch);
      appendMessage(systemMessage(update.successMessage));
    })
    .catch(() => appendMessage(systemMessage(update.failureMessage)));
}
