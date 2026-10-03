import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch, apiPath, notifySuccess } from '../../../utils/api';
import { useAdventureCollection } from '../hooks/useAdventureCollection';
import { useWorldCollection } from '../hooks/useWorldCollection';
import { CardGrid } from './CardGrid';
import { EntityCard } from './EntityCard';

type BrowseTab = 'adventures' | 'worlds';

function AdventuresTab() {
  const { t } = useTranslation('common');
  const { items, isLoading, hasMore, loadMore, removeItem } = useAdventureCollection('EXPLORE');
  const handleDelete = (id: string) => apiFetch(apiPath`/api/adventures/${id}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) return;
    removeItem(id);
    window.dispatchEvent(new Event('adventure-list-changed'));
    notifySuccess(t('toast.deleted'));
  }).catch(() => {});

  return (
    <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
      {items.map((a) => (
        <EntityCard key={a.id} kind="adventure" id={a.id} name={a.name} description={a.description} visibility={a.visibility} imageUrl={a.imageUrl} uiImagePositionX={a.uiImagePositionX} uiImagePositionY={a.uiImagePositionY} canWrite={a.canWrite} onDelete={handleDelete} />
      ))}
    </CardGrid>
  );
}

function WorldsTab() {
  const { t } = useTranslation('common');
  const { items, isLoading, hasMore, loadMore, removeItem } = useWorldCollection('EXPLORE');
  const handleDelete = (id: string) => apiFetch(apiPath`/api/worlds/${id}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) return;
    removeItem(id);
    notifySuccess(t('toast.deleted'));
  }).catch(() => {});

  return (
    <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
      {items.map((w) => (
        <EntityCard key={w.id} kind="world" id={w.id} name={w.name} description={w.description} visibility={w.visibility} imageUrl={w.imageUrl} uiImagePositionX={w.uiImagePositionX} uiImagePositionY={w.uiImagePositionY} canWrite={w.canWrite} onDelete={handleDelete} />
      ))}
    </CardGrid>
  );
}

export default function BrowsePage() {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('collection');
  const raw = searchParams.get('tab');
  const activeTab: BrowseTab = raw === 'worlds' ? raw : 'adventures';

  const TABS: { id: BrowseTab; label: string }[] = [
    { id: 'adventures', label: t('browse.tabs.adventures') },
    { id: 'worlds', label: t('browse.tabs.worlds') },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-foreground">{t('browse.title')}</h1>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            to={`/explore?tab=${tab.id}`}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {activeTab === 'adventures' && <AdventuresTab />}
      {activeTab === 'worlds' && <WorldsTab />}
    </div>
  );
}
