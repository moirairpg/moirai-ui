import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
import { useAdventureCollection } from '../hooks/useAdventureCollection';
import { useWorldCollection } from '../hooks/useWorldCollection';
import { usePersonaCollection } from '../hooks/usePersonaCollection';
import { CardGrid } from './CardGrid';
import { EntityCard } from './EntityCard';

export function AdventureBrowsePage() {
  const navigate = useNavigate();
  const { items, isLoading, hasMore, loadMore, removeItem } = useAdventureCollection('EXPLORE');
  const handlePlay = (id: string) => navigate(`/adventure/play/${id}`);
  const handleView = (id: string) => console.log('view', id);
  const handleEdit = (id: string) => console.log('edit', id);
  const handleDelete = (id: string) => apiFetch(`/api/adventure/${id}`, { method: 'DELETE' }).then(() => removeItem(id)).catch(() => {});

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-foreground">Browse Adventures</h1>
      <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
        {items.map((a) => (
          <EntityCard key={a.id} kind="adventure" id={a.id} name={a.name} description={a.description} visibility={a.visibility} canWrite={a.canWrite} onPlay={handlePlay} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </CardGrid>
    </div>
  );
}

export function WorldBrowsePage() {
  const { items, isLoading, hasMore, loadMore, removeItem } = useWorldCollection('EXPLORE');
  const handleView = (id: string) => console.log('view', id);
  const handleEdit = (id: string) => console.log('edit', id);
  const handleDelete = (id: string) => apiFetch(`/api/world/${id}`, { method: 'DELETE' }).then(() => removeItem(id)).catch(() => {});

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-foreground">Browse Worlds</h1>
      <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
        {items.map((w) => (
          <EntityCard key={w.id} kind="world" id={w.id} name={w.name} description={w.description} visibility={w.visibility} canWrite={w.canWrite} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </CardGrid>
    </div>
  );
}

export function PersonaBrowsePage() {
  const { items, isLoading, hasMore, loadMore, removeItem } = usePersonaCollection('EXPLORE');
  const handleView = (id: string) => console.log('view', id);
  const handleEdit = (id: string) => console.log('edit', id);
  const handleDelete = (id: string) => apiFetch(`/api/persona/${id}`, { method: 'DELETE' }).then(() => removeItem(id)).catch(() => {});

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-foreground">Browse Personas</h1>
      <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
        {items.map((p) => (
          <EntityCard key={p.id} kind="persona" id={p.id} name={p.name} personality={p.personality} visibility={p.visibility} canWrite={p.canWrite} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </CardGrid>
    </div>
  );
}
