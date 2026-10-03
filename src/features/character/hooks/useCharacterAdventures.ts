import { useState, useEffect } from 'react';
import { apiFetch, apiPath } from '../../../utils/api';
import type { CharacterAdventureSummary } from '../types';

export function useCharacterAdventures(characterId: string | undefined, enabled: boolean): CharacterAdventureSummary[] {
  const [adventures, setAdventures] = useState<CharacterAdventureSummary[]>([]);

  useEffect(() => {
    if (!characterId || !enabled) {
      setAdventures([]);
      return;
    }

    apiFetch(apiPath`/api/player-characters/${characterId}/adventures`)
      .then((res) => (res.ok ? res.json() : []))
      .then((json: CharacterAdventureSummary[]) => setAdventures(json))
      .catch(() => setAdventures([]));
  }, [characterId, enabled]);

  return adventures;
}
