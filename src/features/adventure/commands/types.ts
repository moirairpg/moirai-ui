export type CommandCategory = 'generation' | 'context';

export type CommandDefinition = {
  name: string;
  category: CommandCategory;
  description: string;
  args: CommandArgDefinition[];
};

export type CommandArgDefinition = {
  name: string;
  type: 'string' | 'integer';
  required: boolean;
  description: string;
};

export type ParsedCommand =
  | { name: 'start' }
  | { name: 'go' }
  | { name: 'retry' }
  | { name: 'say'; text: string }
  | { name: 'nudge'; text: string }
  | { name: 'authors-note'; text: string }
  | { name: 'scene'; text: string }
  | { name: 'bump'; text: string; frequency: number }
  | { name: 'unknown'; raw: string }
  | { name: 'missing-arg'; commandName: string; argName: string; argDescription: string }
  | { name: 'invalid-arg'; commandName: string; argName: string; message: string };
