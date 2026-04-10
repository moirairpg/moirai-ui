import { useState, useEffect } from 'react';
import { apiFetch } from '../../../utils/api';
import type { AdventureDetails } from '../types';

type AdventureSummary = {
  id: string;
  name: string;
  description: string;
  worldName: string;
  personaName: string;
  visibility: string;
  creationDate: string;
};

type PaginatedResult<T> = {
  data: T[];
};

export function useRecentAdventures(): { data: AdventureDetails[] | undefined } {
  const [data, setData] = useState<AdventureDetails[] | undefined>(undefined);

  useEffect(() => {
    apiFetch('/api/adventure?view=MY_STUFF&sorting_field=LAST_UPDATE_DATE&direction=DESC&size=3')
      .then((res) => res.json())
      .then((json: PaginatedResult<AdventureSummary>) => {
        const mapped = json.data.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          worldName: s.worldName,
          personaName: s.personaName,
        }));
        setData(mapped as AdventureDetails[]);
      })
      .catch(() => setData([]));
  }, []);

  return { data };
}
