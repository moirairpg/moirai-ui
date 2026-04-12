type LorebookImportEntry = { name: string; description: string; playerId?: string };

type WorldImport = {
  name: string;
  description: string;
  adventureStart: string;
  visibility: string;
  narratorName: string;
  narratorPersonality: string;
  lorebook: LorebookImportEntry[];
};

type AdventureImport = WorldImport & {
  moderation: string;
  isMultiplayer?: boolean;
  modelConfiguration?: { aiModel?: string; maxTokenLimit?: number; temperature?: number };
  contextAttributes?: { nudge?: string; authorsNote?: string; scene?: string; bump?: string; bumpFrequency?: number };
};

function str(val: unknown): string {
  return typeof val === 'string' ? val : '';
}

function parseLorebookEntries(val: unknown): LorebookImportEntry[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((e): e is Record<string, unknown> => typeof e === 'object' && e !== null)
    .map((e) => ({
      name: str(e.name),
      description: str(e.description),
      ...(typeof e.playerId === 'string' && { playerId: e.playerId }),
    }))
    .filter((e) => e.name || e.description);
}

export function parseWorldJson(raw: unknown): WorldImport {
  if (typeof raw !== 'object' || raw === null) return { name: '', description: '', adventureStart: '', visibility: '', narratorName: '', narratorPersonality: '', lorebook: [] };
  const j = raw as Record<string, unknown>;
  return {
    name: str(j.name),
    description: str(j.description),
    adventureStart: str(j.adventureStart),
    visibility: str(j.visibility),
    narratorName: str(j.narratorName),
    narratorPersonality: str(j.narratorPersonality),
    lorebook: parseLorebookEntries(j.lorebook),
  };
}

export function parseAdventureJson(raw: unknown): AdventureImport {
  if (typeof raw !== 'object' || raw === null) return { name: '', description: '', adventureStart: '', visibility: '', narratorName: '', narratorPersonality: '', lorebook: [], moderation: '' };
  const j = raw as Record<string, unknown>;
  const mc = typeof j.modelConfiguration === 'object' && j.modelConfiguration !== null
    ? j.modelConfiguration as Record<string, unknown>
    : null;
  const ca = typeof j.contextAttributes === 'object' && j.contextAttributes !== null
    ? j.contextAttributes as Record<string, unknown>
    : null;
  return {
    name: str(j.name),
    description: str(j.description),
    adventureStart: str(j.adventureStart),
    visibility: str(j.visibility),
    narratorName: str(j.narratorName),
    narratorPersonality: str(j.narratorPersonality),
    lorebook: parseLorebookEntries(j.lorebookEntries ?? j.lorebook),
    moderation: str(j.moderation),
    ...(typeof j.isMultiplayer === 'boolean' && { isMultiplayer: j.isMultiplayer }),
    ...(mc && {
      modelConfiguration: {
        ...(typeof mc.aiModel === 'string' && { aiModel: mc.aiModel }),
        ...(typeof mc.maxTokenLimit === 'number' && { maxTokenLimit: mc.maxTokenLimit }),
        ...(typeof mc.temperature === 'number' && { temperature: mc.temperature }),
      },
    }),
    ...(ca && {
      contextAttributes: {
        nudge: str(ca.nudge),
        authorsNote: str(ca.authorsNote),
        scene: str(ca.scene),
        bump: str(ca.bump),
        ...(typeof ca.bumpFrequency === 'number' && { bumpFrequency: ca.bumpFrequency }),
      },
    }),
  };
}

export function useJsonImport(onImport: (raw: unknown) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 1_000_000) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onImport(JSON.parse(reader.result as string));
      } catch {
        // invalid JSON — ignore silently
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };
}
