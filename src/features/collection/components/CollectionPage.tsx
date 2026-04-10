import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
import { useAdventureCollection } from '../hooks/useAdventureCollection';
import { useWorldCollection } from '../hooks/useWorldCollection';
import { usePersonaCollection } from '../hooks/usePersonaCollection';
import { CardGrid } from './CardGrid';
import { EntityCard } from './EntityCard';
import type { CollectionView, CollectionTab } from '../types';

type TabProps = { view: CollectionView };

function AdventureTab({ view }: TabProps) {
  const navigate = useNavigate();
  const { items, isLoading, hasMore, loadMore, removeItem } = useAdventureCollection(view);
  const handlePlay = (id: string) => navigate(`/adventure/play/${id}`);
  const handleView = (id: string) => console.log('view', id);
  const handleEdit = (id: string) => console.log('edit', id);
  const handleDelete = (id: string) => apiFetch(`/api/adventure/${id}`, { method: 'DELETE' }).then(() => removeItem(id)).catch(() => {});

  return (
    <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
      {items.map((a) => (
        <EntityCard key={a.id} kind="adventure" id={a.id} name={a.name} description={a.description} visibility={a.visibility} canWrite={a.canWrite} onPlay={handlePlay} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </CardGrid>
  );
}

function WorldTab({ view }: TabProps) {
  const { items, isLoading, hasMore, loadMore, removeItem } = useWorldCollection(view);
  const handleView = (id: string) => console.log('view', id);
  const handleEdit = (id: string) => console.log('edit', id);
  const handleDelete = (id: string) => apiFetch(`/api/world/${id}`, { method: 'DELETE' }).then(() => removeItem(id)).catch(() => {});

  return (
    <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
      {items.map((w) => (
        <EntityCard key={w.id} kind="world" id={w.id} name={w.name} description={w.description} visibility={w.visibility} canWrite={w.canWrite} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </CardGrid>
  );
}

function PersonaTab({ view }: TabProps) {
  const { items, isLoading, hasMore, loadMore, removeItem } = usePersonaCollection(view);
  const handleView = (id: string) => console.log('view', id);
  const handleEdit = (id: string) => console.log('edit', id);
  const handleDelete = (id: string) => apiFetch(`/api/persona/${id}`, { method: 'DELETE' }).then(() => removeItem(id)).catch(() => {});

  return (
    <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
      {items.map((p) => (
        <EntityCard key={p.id} kind="persona" id={p.id} name={p.name} personality={p.personality} visibility={p.visibility} canWrite={p.canWrite} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </CardGrid>
  );
}

const TABS: { id: CollectionTab; label: string }[] = [
  { id: 'adventures', label: 'Adventures' },
  { id: 'worlds', label: 'Worlds' },
  { id: 'personas', label: 'Personas' },
];

type CollectionPageProps = { view: CollectionView; title: string };

export default function CollectionPage({ view, title }: CollectionPageProps) {
  const [activeTab, setActiveTab] = useState<CollectionTab>('adventures');

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'adventures' && <AdventureTab view={view} />}
      {activeTab === 'worlds' && <WorldTab view={view} />}
      {activeTab === 'personas' && <PersonaTab view={view} />}
    </div>
  );
}
