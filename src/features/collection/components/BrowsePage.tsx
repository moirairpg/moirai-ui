import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
import { useAdventureCollection } from '../hooks/useAdventureCollection';
import { useWorldCollection } from '../hooks/useWorldCollection';
import { usePersonaCollection } from '../hooks/usePersonaCollection';
import { CardGrid } from './CardGrid';
import { EntityCard } from './EntityCard';

type BrowseTab = 'adventures' | 'worlds' | 'personas';

const TABS: { id: BrowseTab; label: string }[] = [
  { id: 'adventures', label: 'Adventures' },
  { id: 'worlds', label: 'Worlds' },
  { id: 'personas', label: 'Personas' },
];

function AdventuresTab() {
  const navigate = useNavigate();
  const { items, isLoading, hasMore, loadMore, removeItem } = useAdventureCollection('EXPLORE');
  const handlePlay = (id: string) => navigate(`/adventure/play/${id}`);
  const handleView = (id: string) => navigate(`/adventure/${id}/view`);
  const handleEdit = (id: string) => navigate(`/adventure/${id}/edit`);
  const handleDelete = (id: string) => apiFetch(`/api/adventure/${id}`, { method: 'DELETE' }).then(() => removeItem(id)).catch(() => {});

  return (
    <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
      {items.map((a) => (
        <EntityCard key={a.id} kind="adventure" id={a.id} name={a.name} description={a.description} visibility={a.visibility} canWrite={a.canWrite} onPlay={handlePlay} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </CardGrid>
  );
}

function WorldsTab() {
  const navigate = useNavigate();
  const { items, isLoading, hasMore, loadMore, removeItem } = useWorldCollection('EXPLORE');
  const handleView = (id: string) => navigate(`/world/${id}/view`);
  const handleEdit = (id: string) => navigate(`/world/${id}/edit`);
  const handleDelete = (id: string) => apiFetch(`/api/world/${id}`, { method: 'DELETE' }).then(() => removeItem(id)).catch(() => {});

  return (
    <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
      {items.map((w) => (
        <EntityCard key={w.id} kind="world" id={w.id} name={w.name} description={w.description} visibility={w.visibility} canWrite={w.canWrite} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </CardGrid>
  );
}

function PersonasTab() {
  const navigate = useNavigate();
  const { items, isLoading, hasMore, loadMore, removeItem } = usePersonaCollection('EXPLORE');
  const handleView = (id: string) => navigate(`/persona/${id}/view`);
  const handleEdit = (id: string) => navigate(`/persona/${id}/edit`);
  const handleDelete = (id: string) => apiFetch(`/api/persona/${id}`, { method: 'DELETE' }).then(() => removeItem(id)).catch(() => {});

  return (
    <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
      {items.map((p) => (
        <EntityCard key={p.id} kind="persona" id={p.id} name={p.name} personality={p.personality} visibility={p.visibility} canWrite={p.canWrite} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </CardGrid>
  );
}

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get('tab');
  const activeTab: BrowseTab = raw === 'worlds' || raw === 'personas' ? raw : 'adventures';

  const setTab = (tab: BrowseTab) => setSearchParams({ tab }, { replace: true });

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-foreground">Explore</h1>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
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

      {activeTab === 'adventures' && <AdventuresTab />}
      {activeTab === 'worlds' && <WorldsTab />}
      {activeTab === 'personas' && <PersonasTab />}
    </div>
  );
}
