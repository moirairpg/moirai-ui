import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch, apiPath, notifySuccess } from '../../../utils/api';
import { useAdventureCollection } from '../hooks/useAdventureCollection';
import { useWorldCollection } from '../hooks/useWorldCollection';
import { useCharacterCollection } from '../hooks/useCharacterCollection';
import { useCharacterClasses } from '../../character/hooks/useCharacterClasses';
import { CardGrid } from './CardGrid';
import { EntityCard } from './EntityCard';
import { CreateAssetCard } from './CreateAssetCard';
import type { CollectionView, CollectionTab } from '../types';

type TabProps = { view: CollectionView };

function AdventureTab({ view }: TabProps) {
  const { t } = useTranslation('collection');
  const { items, isLoading, hasMore, loadMore, removeItem } = useAdventureCollection(view);
  const handleDelete = (id: string) => apiFetch(apiPath`/api/adventures/${id}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) return;
    removeItem(id);
    window.dispatchEvent(new Event('adventure-list-changed'));
    notifySuccess(t('toast.deleted', { ns: 'common' }));
  }).catch(() => {});

  return (
    <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
      {view === 'MY_STUFF' && <CreateAssetCard to="/adventure/new" label={t('create.adventure')} />}
      {items.map((a) => (
        <EntityCard key={a.id} kind="adventure" id={a.id} name={a.name} description={a.description} visibility={a.visibility} imageUrl={a.imageUrl} uiImagePositionX={a.uiImagePositionX} uiImagePositionY={a.uiImagePositionY} canWrite={a.canWrite} onDelete={handleDelete} />
      ))}
    </CardGrid>
  );
}

function WorldTab({ view }: TabProps) {
  const { t } = useTranslation('collection');
  const { items, isLoading, hasMore, loadMore, removeItem } = useWorldCollection(view);
  const handleDelete = (id: string) => apiFetch(apiPath`/api/worlds/${id}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) return;
    removeItem(id);
    notifySuccess(t('toast.deleted', { ns: 'common' }));
  }).catch(() => {});

  return (
    <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
      {view === 'MY_STUFF' && <CreateAssetCard to="/world/new" label={t('create.world')} />}
      {items.map((w) => (
        <EntityCard key={w.id} kind="world" id={w.id} name={w.name} description={w.description} visibility={w.visibility} imageUrl={w.imageUrl} uiImagePositionX={w.uiImagePositionX} uiImagePositionY={w.uiImagePositionY} canWrite={w.canWrite} onDelete={handleDelete} />
      ))}
    </CardGrid>
  );
}

function CharacterTab() {
  const { t } = useTranslation('character');
  const { items, isLoading, hasMore, loadMore, removeItem } = useCharacterCollection();
  const { labelOf } = useCharacterClasses();

  const handleDelete = (id: string) => apiFetch(apiPath`/api/player-characters/${id}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) return;
    removeItem(id);
    notifySuccess(t('toast.deleted', { ns: 'common' }));
  }).catch(() => {});

  const classLabelOf = (characterClass: string | null) => {
    const resolved = labelOf(characterClass);
    return resolved === null ? null : t(`classes.${characterClass}`, { defaultValue: resolved });
  };

  return (
    <CardGrid isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore}>
      <CreateAssetCard to="/character/new" label={t('create.character', { ns: 'collection' })} />
      {items.map((c) => (
        <EntityCard key={c.id} kind="character" id={c.id} name={c.name} classLabel={classLabelOf(c.characterClass)} background={c.background} imageUrl={c.imageUrl} uiImagePositionX={c.uiImagePositionX} uiImagePositionY={c.uiImagePositionY} onDelete={handleDelete} />
      ))}
    </CardGrid>
  );
}

type CollectionPageProps = { view: CollectionView };

export default function CollectionPage({ view }: CollectionPageProps) {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('collection');

  const title = view === 'MY_STUFF' ? t('myStuff.title') : t('sharedWithMe.title');
  const basePath = view === 'MY_STUFF' ? '/my-stuff' : '/shared-with-me';

  const TABS: { id: CollectionTab; label: string }[] = [
    { id: 'adventures', label: t('myStuff.tabs.adventures') },
    { id: 'worlds', label: t('myStuff.tabs.worlds') },
    ...(view === 'MY_STUFF' ? [{ id: 'characters' as const, label: t('myStuff.tabs.characters') }] : []),
  ];

  const raw = searchParams.get('tab');
  const activeTab: CollectionTab = TABS.some((tab) => tab.id === raw) ? (raw as CollectionTab) : 'adventures';

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            to={`${basePath}?tab=${tab.id}`}
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

      {activeTab === 'adventures' && <AdventureTab view={view} />}
      {activeTab === 'worlds' && <WorldTab view={view} />}
      {activeTab === 'characters' && view === 'MY_STUFF' && <CharacterTab />}
    </div>
  );
}
