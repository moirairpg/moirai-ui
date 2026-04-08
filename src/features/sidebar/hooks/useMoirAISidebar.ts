import { useCallback, useState } from 'react';

type Section = 'adventures' | 'worlds' | 'personas';

function loadExpanded(): Set<Section> {
  try {
    const raw = localStorage.getItem('moirai-sidebar-expanded');
    return raw ? new Set(JSON.parse(raw) as Section[]) : new Set(['adventures']);
  } catch {
    return new Set(['adventures']);
  }
}

function saveExpanded(expanded: Set<Section>) {
  localStorage.setItem('moirai-sidebar-expanded', JSON.stringify([...expanded]));
}

export function useMoirAISidebar() {
  const [expanded, setExpanded] = useState<Set<Section>>(loadExpanded);

  const toggle = useCallback((section: Section) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      saveExpanded(next);
      return next;
    });
  }, []);

  return { expanded, toggle };
}
