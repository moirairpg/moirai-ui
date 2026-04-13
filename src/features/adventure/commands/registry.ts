import type { CommandDefinition } from './types';

export const COMMANDS: CommandDefinition[] = [
  {
    name: 'start',
    category: 'generation',
    description: 'Write the opening of the story',
    args: [],
  },
  {
    name: 'go',
    category: 'generation',
    description: 'Let the story continue without you saying anything',
    args: [],
  },
  {
    name: 'retry',
    category: 'generation',
    description: "Didn't like that response? Throw it out and get a new one",
    args: [],
  },
  {
    name: 'say',
    category: 'generation',
    description: 'Write a line as the narrator — no AI response follows',
    args: [{ name: 'text', type: 'string', required: true, description: 'Dialogue text' }],
  },
  {
    name: 'nudge',
    category: 'context',
    description: 'Whisper an ongoing instruction to the AI — use it to shape tone, pacing, or behavior',
    args: [{ name: 'text', type: 'string', required: true, description: 'Nudge instruction' }],
  },
  {
    name: 'authors-note',
    category: 'context',
    description: 'Shape how the story is told — the mood, the tone, the style — without changing what happens in it',
    args: [{ name: 'text', type: 'string', required: true, description: 'Author note text' }],
  },
  {
    name: 'scene',
    category: 'context',
    description: 'Describe where the story is taking place so the AI always has it in mind',
    args: [{ name: 'text', type: 'string', required: true, description: 'Scene description' }],
  },
  {
    name: 'bump',
    category: 'context',
    description: 'Keep something important from being forgotten — it repeats quietly in the background throughout the conversation',
    args: [
      { name: 'text', type: 'string', required: true, description: 'Bump text' },
      { name: 'frequency', type: 'integer', required: true, description: 'Interleave every N messages' },
    ],
  },
];
