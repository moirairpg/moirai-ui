import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../../utils/api';
import { useAdventureCollection } from '../hooks/useAdventureCollection';
import { useWorldCollection } from '../hooks/useWorldCollection';
import { CardGrid } from './CardGrid';
import { EntityCard } from './EntityCard';

type BrowseTab = 'adventures' | 'worlds';

function AdventuresTab() {
  const navigate = useNavigate();
  const { items, isLoading, hasMore, loadMore, removeItem } = useAdventureCollection('EXPLORE');
  const handlePlay = (id: string) => navigate(`/adventure/play/${id}`);
  const handleView = (id: string) => navigate(`/adventure/${id}/view`);
  const handleEdit = (id: string) => navigate(`/adventure/${id}/edit`);
  const handleDelete = (id: string) => apiFetch(`/api/adventures/${id}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) return;
    removeItem(id);
    window.dispatchEvent(new Event('adventure-list-changed'));
  }).catch(() => {});

  return (
    <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
      {items.map((a) => (
        <EntityCard key={a.id} kind="adventure" id={a.id} name={a.name} description={a.description} visibility={a.visibility} imageUrl={a.imageUrl} canWrite={a.canWrite} onPlay={handlePlay} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </CardGrid>
  );
}

function WorldsTab() {
  const navigate = useNavigate();
  const { items, isLoading, hasMore, loadMore, removeItem } = useWorldCollection('EXPLORE');
  const handleView = (id: string) => navigate(`/world/${id}/view`);
  const handleEdit = (id: string) => navigate(`/world/${id}/edit`);
  const handleDelete = (id: string) => apiFetch(`/api/worlds/${id}`, { method: 'DELETE' }).then((res) => { if (res.ok) removeItem(id); }).catch(() => {});

  return (
    <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
      {items.map((w) => (
        <EntityCard key={w.id} kind="world" id={w.id} name={w.name} description={w.description} visibility={w.visibility} imageUrl={w.imageUrl} canWrite={w.canWrite} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </CardGrid>
  );
}

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation('collection');
  const raw = searchParams.get('tab');
  const activeTab: BrowseTab = raw === 'worlds' ? raw : 'adventures';

  const setTab = (tab: BrowseTab) => setSearchParams({ tab }, { replace: true });

  const TABS: { id: BrowseTab; label: string }[] = [
    { id: 'adventures', label: t('browse.tabs.adventures') },
    { id: 'worlds', label: t('browse.tabs.worlds') },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-foreground">{t('browse.title')}</h1>

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
    </div>
  );
}
