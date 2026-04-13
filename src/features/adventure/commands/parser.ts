import type { CommandDefinition, ParsedCommand } from './types';
import { COMMANDS } from './registry';

export function parseCommand(input: string): ParsedCommand | null {
  if (!input.startsWith('/')) return null;

  const trimmed = input.slice(1).trimStart();
  const spaceIdx = trimmed.indexOf(' ');
  const name = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
  const rest = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1).trim();

  const known = COMMANDS.find((c) => c.name === name);

  if (!known) {
    return { name: 'unknown', raw: name };
  }

  switch (name) {
    case 'start':
    case 'go':
    case 'retry':
      return { name };
    case 'say':
    case 'nudge':
    case 'authors-note':
    case 'scene': {
      if (!rest) {
        return { name: 'missing-arg', commandName: name, argName: 'text', argDescription: known.args[0].description };
      }
      return { name, text: rest };
    }
    case 'bump': {
      const parts = rest.split(/\s+/).filter(Boolean);

      if (parts.length === 0) {
        return { name: 'missing-arg', commandName: 'bump', argName: 'text', argDescription: known.args[0].description };
      }

      if (parts.length < 2) {
        return { name: 'missing-arg', commandName: 'bump', argName: 'frequency', argDescription: known.args[1].description };
      }

      const frequency = parseInt(parts[parts.length - 1], 10);

      if (!Number.isInteger(frequency) || frequency <= 0) {
        return { name: 'invalid-arg', commandName: 'bump', argName: 'frequency', message: 'must be a positive whole number' };
      }

      const text = parts.slice(0, -1).join(' ');
      return { name, text, frequency };
    }
    default:
      return null;
  }
}

export function matchesPrefix(input: string): CommandDefinition[] {
  if (!input.startsWith('/')) return [];
  const typed = input.slice(1).toLowerCase();
  return COMMANDS.filter((c) => c.name.startsWith(typed));
}
