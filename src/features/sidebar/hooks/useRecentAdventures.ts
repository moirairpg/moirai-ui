import { useState, useEffect } from 'react';
import { apiFetch } from '../../../utils/api';

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

export function useRecentAdventures(): { data: AdventureSummary[] | undefined } {
  const [data, setData] = useState<AdventureSummary[] | undefined>(undefined);

  useEffect(() => {
    const fetch = () => {
      apiFetch('/api/adventure?view=MY_STUFF&sorting_field=LAST_UPDATE_DATE&direction=DESC&size=3')
        .then((res) => res.json())
        .then((json: PaginatedResult<AdventureSummary>) => setData(json.data))
        .catch(() => setData([]));
    };
    fetch();
    window.addEventListener('adventure-list-changed', fetch);
    return () => window.removeEventListener('adventure-list-changed', fetch);
  }, []);

  return { data };
}
