import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch, apiPath, api, extractApiError } from '../../../utils/api';
import { objectPositionOf } from '../../../utils/imagePosition';
import { useCharacterClasses } from '../../character/hooks/useCharacterClasses';
import type { PlayerCharacterSummary } from '../../collection/types';
import type { PlayerCharacterDetails } from '../../character/types';

type JoinAdventureModalProps = {
  invitationId: string;
  adventureName: string;
  onJoined: () => void;
  onClose: () => void;
};

export function JoinAdventureModal({ invitationId, adventureName, onJoined, onClose }: JoinAdventureModalProps) {
  const { t } = useTranslation('notifications');
  const { labelOf } = useCharacterClasses();
  const trackRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerCharacterSummary[]>([]);
  const [searching, setSearching] = useState(true);
  const [detail, setDetail] = useState<PlayerCharacterDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearching(true);
    const handle = setTimeout(() => {
      api.character.search(query)
        .then((res) => (res.ok ? res.json() : []))
        .then((json: PlayerCharacterSummary[]) => setResults(json))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [query]);

  const openDetail = (id: string) => {
    setDetailLoading(true);
    setError('');
    apiFetch(apiPath`/api/player-characters/${id}`)
      .then((res) => res.json())
      .then((data: PlayerCharacterDetails) => setDetail(data))
      .catch(() => setError(t('invite.join.errors.detailFailed')))
      .finally(() => setDetailLoading(false));
  };

  const choose = async (id: string) => {
    setJoiningId(id);
    setError('');
    const res = await api.adventureInvitations.join(invitationId, id);
    if (!res.ok) {
      setError((await extractApiError(res)) ?? t('invite.join.errors.failed'));
      setJoiningId(null);
      return;
    }
    window.dispatchEvent(new Event('adventure-list-changed'));
    onJoined();
  };

  const scroll = (direction: number) => trackRef.current?.scrollBy({ left: direction * 240, behavior: 'smooth' });
  const noCharactersAtAll = !searching && query.trim() === '' && results.length === 0;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-4 rounded-lg border border-border bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t('invite.join.title', { adventure: adventureName })}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('invite.join.subtitle')}</p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {detail ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              {detail.imageUrl ? (
                <img
                  src={detail.imageUrl}
                  alt={detail.name}
                  className="h-40 w-32 flex-shrink-0 rounded-md object-cover"
                  style={{ objectPosition: objectPositionOf(detail.uiImagePositionX, detail.uiImagePositionY) }}
                />
              ) : (
                <div className="flex h-40 w-32 flex-shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                  {detail.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col gap-1 overflow-y-auto">
                <span className="text-base font-semibold text-foreground">{detail.name}</span>
                <span className="text-sm text-muted-foreground">{labelOf(detail.characterClass)}</span>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{detail.personality}</p>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{detail.physicalDescription}</p>
              </div>
            </div>
            {detail.characterClass === null && (
              <span className="self-start rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                {t('invite.join.needsClass')}
              </span>
            )}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t('invite.join.back')}
              </button>
              <button
                type="button"
                onClick={() => choose(detail.id)}
                disabled={joiningId !== null || detail.characterClass === null}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {joiningId === detail.id ? t('invite.join.joining') : t('invite.join.choose')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('invite.join.searchPlaceholder')}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />

            {searching || detailLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('invite.join.loading')}</p>
            ) : noCharactersAtAll ? (
              <a
                href="/character/new"
                className="rounded-md border border-border px-3 py-2 text-center text-sm text-primary underline-offset-2 hover:underline"
              >
                {t('invite.join.empty')}
              </a>
            ) : results.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('invite.join.noMatches')}</p>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scroll(-1)}
                  className="flex-shrink-0 rounded-full border border-border p-1 text-foreground hover:bg-muted"
                  aria-label={t('invite.join.scrollLeft')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div ref={trackRef} className="flex flex-1 gap-3 overflow-x-auto scroll-smooth py-1">
                  {results.map((character) => (
                    <div
                      key={character.id}
                      className="flex w-40 flex-shrink-0 flex-col gap-2 rounded-md border border-border p-2"
                    >
                      {character.imageUrl ? (
                        <img
                          src={character.imageUrl}
                          alt={character.name}
                          className="h-28 w-full rounded object-cover"
                          style={{ objectPosition: objectPositionOf(character.uiImagePositionX, character.uiImagePositionY) }}
                        />
                      ) : (
                        <div className="flex h-28 w-full items-center justify-center rounded bg-muted text-lg text-muted-foreground">
                          {character.name.charAt(0)}
                        </div>
                      )}
                      <span className="truncate text-sm font-medium text-foreground">{character.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{labelOf(character.characterClass)}</span>
                      {character.characterClass === null && (
                        <span className="self-start rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          {t('invite.join.needsClass')}
                        </span>
                      )}
                      <div className="mt-1 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => choose(character.id)}
                          disabled={joiningId !== null || character.characterClass === null}
                          className="flex-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                          {joiningId === character.id ? t('invite.join.joining') : t('invite.join.choose')}
                        </button>
                        <button
                          type="button"
                          onClick={() => openDetail(character.id)}
                          className="flex-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          {t('invite.join.details')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => scroll(1)}
                  className="flex-shrink-0 rounded-full border border-border p-1 text-foreground hover:bg-muted"
                  aria-label={t('invite.join.scrollRight')}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            {t('invite.join.cancel')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
