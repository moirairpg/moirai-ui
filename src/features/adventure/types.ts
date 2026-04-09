export type AdventureMessageRole = 'user' | 'persona' | 'system';

export type AdventureMessage = {
  id: string;
  role: AdventureMessageRole;
  content: string;
  personaName?: string;
};
