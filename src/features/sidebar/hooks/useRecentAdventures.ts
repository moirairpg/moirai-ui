import type { AdventureDetails } from '../types';

export function useRecentAdventures(): { data: AdventureDetails[] | undefined } {
  return { data: [] };
}
