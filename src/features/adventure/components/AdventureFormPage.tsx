import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, Info, Pencil, Plus, Trash2 } from 'lucide-react';
import type { AdventureDetails, ModelConfiguration, ContextAttributes } from '../../sidebar/types';
import { apiFetch, api, extractApiError } from '../../../utils/api';
import { EntityBanner, Tooltip } from '../../../shared/view/ui';
import { useJsonImport, parseAdventureJson } from '../../../utils/jsonImport';
import { buildImagePrompt } from '../../../utils/imagePrompt';

type AdventureFormPageProps = { mode: 'view' | 'edit' | 'create' };

type SelectOption = { id: string; name: string; description?: string; visibility?: string; imageUrl?: string | null };

type LorebookEntry = { id?: string; name: string; description: string; playerId: string };

type FormState = {
  name: string;
  description: string;
  worldId: string | null;
  narratorName: string;
  narratorPersonality: string;
  visibility: string;
  moderation: string;
  isMultiplayer: boolean;
  adventureStart: string;
  modelConfiguration: ModelConfiguration;
  contextAttributes: ContextAttributes;
};

const EMPTY: FormState = {
  name: '',
  description: '',
  worldId: null,
  narratorName: '',
  narratorPersonality: '',
  visibility: 'PRIVATE',
  moderation: 'STRICT',
  isMultiplayer: false,
  adventureStart: '',
  modelConfiguration: { aiModel: 'GPT54_MINI', maxTokenLimit: 100, temperature: 0.8 },
  contextAttributes: { nudge: '', bump: '', bumpFrequency: 0 },
};

const EMPTY_ENTRY: LorebookEntry = { name: '', description: '', playerId: '' };

function CardPicker({
  options,
  value,
  onChange,
  readOnly,
  emptyText,
  viewBasePath,
  onView,
  nullable,
  noneLabel,
}: {
  options: SelectOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  readOnly: boolean;
  emptyText: string;
  viewBasePath: string;
  onView?: (id: string) => void;
  nullable?: boolean;
  noneLabel?: string;
}) {
  if (readOnly) {
    const selected = options.find((o) => o.id === value);
    return (
      <div className={`${INPUT_CLASS} cursor-not-allowed opacity-50`}>{selected?.name ?? '—'}</div>
    );
  }

  if (options.length === 0 && !nullable) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {nullable && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`flex items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-sm font-medium transition-colors ${
            value === null
              ? 'border-primary bg-primary/10 text-foreground'
              : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
          }`}
        >
          {noneLabel ?? 'None'}
        </button>
      )}
      {options.length === 0 && nullable && (
        <p className="col-span-full text-sm text-muted-foreground">{emptyText}</p>
      )}
      {options.map((option) => (
        <div
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`relative flex cursor-pointer flex-col overflow-hidden rounded-lg border-2 bg-card transition-colors ${
            value === option.id
              ? 'border-primary'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="relative h-40 flex-shrink-0 bg-muted">
            {option.imageUrl && (
              <img src={option.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
            {onView ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onView(option.id); }}
                className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white hover:bg-black/80"
              >
                <Eye className="h-3 w-3" />
              </button>
            ) : (
              <a
                href={`${viewBasePath}/${option.id}/view`}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white hover:bg-black/80"
              >
                <Eye className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="flex flex-col gap-1 p-3">
            <p className="truncate text-sm font-semibold text-foreground">{option.name}</p>
            {option.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">{option.description}</p>
            )}
            {option.visibility && (
              <span className="mt-1 inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {option.visibility}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const INPUT_CLASS = 'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50';
const TEXTAREA_CLASS = `resize-y ${INPUT_CLASS}`;

function LorebookEntryForm({
  value,
  onChange,
  onDone,
  onCancel,
  namePlaceholder,
  descriptionPlaceholder,
  playerIdPlaceholder,
  doneLabel,
  cancelLabel,
}: {
  value: LorebookEntry;
  onChange: (entry: LorebookEntry) => void;
  onDone: () => void;
  onCancel: () => void;
  namePlaceholder: string;
  descriptionPlaceholder: string;
  playerIdPlaceholder: string;
  doneLabel: string;
  cancelLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-4">
      <input
        type="text"
        placeholder={namePlaceholder}
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        className={INPUT_CLASS}
        autoFocus
      />
      <textarea
        rows={3}
        placeholder={descriptionPlaceholder}
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        className={TEXTAREA_CLASS}
      />
      <input
        type="text"
        placeholder={playerIdPlaceholder}
        value={value.playerId}
        onChange={(e) => onChange({ ...value, playerId: e.target.value })}
        className={INPUT_CLASS}
      />
      <div className="flex gap-2">
        <button type="button" onClick={onDone} disabled={!value.name.trim() || !value.description.trim()} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {doneLabel}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted">
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}

export default function AdventureFormPage({ mode }: AdventureFormPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { adventureId } = useParams<{ adventureId: string }>();
  const { t } = useTranslation('adventure');
  const [form, setForm] = useState<FormState>(EMPTY);
  const [worlds, setWorlds] = useState<SelectOption[]>([]);
  const [lorebook, setLorebook] = useState<LorebookEntry[]>([]);
  const [createLorebook, setCreateLorebook] = useState<LorebookEntry[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [addingNew, setAddingNew] = useState(false);
  const [newDraft, setNewDraft] = useState<LorebookEntry>(EMPTY_ENTRY);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<LorebookEntry>(EMPTY_ENTRY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [worldName, setWorldName] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uiImagePositionX, setUiImagePositionX] = useState(0.5);
  const [uiImagePositionY, setUiImagePositionY] = useState(0.5);
  const [submitted, setSubmitted] = useState(false);
  const [worldFilter, setWorldFilter] = useState('');
  const [worldPage, setWorldPage] = useState(1);
  const [worldTotalPages, setWorldTotalPages] = useState(1);
  const [lorebookFilter, setLorebookFilter] = useState('');

  const readOnly = mode === 'view';
  const errorBorder = (value: string, required = true) => required && submitted && !value.trim() ? ' border-red-500' : '';
  const title = mode === 'create' ? t('form.title.new') : mode === 'edit' ? t('form.title.edit') : t('form.title.fallback');

  useEffect(() => {
    setSaving(false);
    setSubmitted(false);
    setError('');
    setWorldFilter('');
    setWorldPage(1);
    setWorldTotalPages(1);
    setLorebookFilter('');
    let restoredFromSnapshot = false;

    if (mode === 'create') {
      const snapshot = location.state?.snapshot as { form: FormState; createLorebook: LorebookEntry[]; deletedIds: string[] } | undefined;
      if (snapshot) {
        setForm(snapshot.form);
        setCreateLorebook(snapshot.createLorebook);
        setDeletedIds(snapshot.deletedIds);
        restoredFromSnapshot = true;
      } else {
        setUiImagePositionX(0.5);
        setUiImagePositionY(0.5);
      }
    }

    const fetches: Promise<void>[] = [];

    if (!restoredFromSnapshot && mode !== 'create' && adventureId) {
      fetches.push(
        apiFetch(`/api/adventure/${adventureId}`)
          .then((r) => r.json())
          .then((data: AdventureDetails) => {
            setForm({
              name: data.name,
              description: data.description,
              worldId: data.worldId ?? null,
              narratorName: data.narratorName ?? '',
              narratorPersonality: data.narratorPersonality ?? '',
              visibility: data.visibility,
              moderation: data.moderation,
              isMultiplayer: data.isMultiplayer,
              adventureStart: data.adventureStart,
              modelConfiguration: data.modelConfiguration,
              contextAttributes: data.contextAttributes,
            });
            setLorebook((data.lorebook ?? []).map((e) => ({
              id: e.id,
              name: e.name,
              description: e.description,
              playerId: e.playerId ?? '',
            })));
            setImageUrl(data.imageUrl ?? null);
            setUiImagePositionX(data.uiImagePositionX ?? 0.5);
            setUiImagePositionY(data.uiImagePositionY ?? 0.5);
          })
      );
    }

    Promise.all(fetches)
      .then(() => setLoading(false))
      .catch(() => {
        setError(t('form.errors.loadFailed'));
        setLoading(false);
      });
  }, [mode, adventureId]);

  useEffect(() => {
    const url = `/api/world?view=EXPLORE&page=${worldPage}&size=4${worldFilter ? `&name=${encodeURIComponent(worldFilter)}` : ''}`;
    apiFetch(url)
      .then((r) => r.json())
      .then((d) => {
        setWorlds((d.data ?? []).map((w: { id: string; name: string; description?: string; visibility?: string; imageUrl?: string | null }) => ({
          id: w.id, name: w.name, description: w.description, visibility: w.visibility, imageUrl: w.imageUrl,
        })));
        setWorldTotalPages(d.totalPages ?? 1);
      });
  }, [worldFilter, worldPage]);

  useEffect(() => {
    if (mode !== 'view' || !form.worldId) return;
    apiFetch(`/api/world/${form.worldId}`)
      .then((r) => r.json())
      .then((w: { name: string }) => setWorldName(w.name))
      .catch(() => {});
  }, [mode, form.worldId]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setModel = (field: keyof ModelConfiguration) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, modelConfiguration: { ...prev.modelConfiguration, [field]: field === 'aiModel' ? e.target.value : Number(e.target.value) } }));

  const setCtx = (field: keyof ContextAttributes) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, contextAttributes: { ...prev.contextAttributes, [field]: field === 'bumpFrequency' ? Number(e.target.value) : e.target.value } }));

  const handleWorldChange = (id: string | null) => {
    if (id === null) {
      setForm((prev) => ({ ...prev, worldId: null, name: '', description: '', adventureStart: '', narratorName: '', narratorPersonality: '' }));
      setCreateLorebook([]);
      setImageUrl(null);
      setImageFile(null);
      return;
    }

    setForm((prev) => ({ ...prev, worldId: id }));

    apiFetch(`/api/world/${id}`)
      .then((res) => res.json())
      .then((world) => {
        setForm((prev) => ({
          ...prev,
          name: world.name ?? '',
          description: world.description ?? '',
          adventureStart: world.adventureStart ?? '',
          narratorName: world.narratorName ?? '',
          narratorPersonality: world.narratorPersonality ?? '',
        }));
        setCreateLorebook((world.lorebook ?? []).map((e: { name: string; description: string; playerId?: string }) => ({
          name: e.name,
          description: e.description,
          playerId: e.playerId ?? '',
        })));
        setImageUrl(world.imageUrl ?? null);
        setImageFile(null);
      })
      .catch(() => {});
  };

  const handleWorldView = (id: string) => {
    navigate(location.pathname, { replace: true, state: { snapshot: { form, createLorebook, deletedIds } } });
    navigate(`/world/${id}/view`);
  };

  const handleJsonImport = useJsonImport((raw) => {
    const data = parseAdventureJson(raw);
    setForm((prev) => ({
      ...prev,
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.adventureStart && { adventureStart: data.adventureStart }),
      ...(data.visibility && { visibility: data.visibility }),
      ...(data.narratorName && { narratorName: data.narratorName }),
      ...(data.narratorPersonality && { narratorPersonality: data.narratorPersonality }),
      ...(data.moderation && { moderation: data.moderation }),
      ...(typeof data.isMultiplayer === 'boolean' && { isMultiplayer: data.isMultiplayer }),
      ...(data.modelConfiguration && { modelConfiguration: { ...prev.modelConfiguration, ...data.modelConfiguration } }),
      ...(data.contextAttributes && { contextAttributes: { ...prev.contextAttributes, ...data.contextAttributes } }),
    }));
    if (data.lorebook.length) setCreateLorebook(data.lorebook.map((e) => ({ name: e.name, description: e.description, playerId: e.playerId ?? '' })));
  });

  const commitNew = () => {
    if (mode === 'create') {
      setCreateLorebook((prev) => [...prev, { ...newDraft }]);
    } else {
      setLorebook((prev) => [...prev, { ...newDraft }]);
    }
    setNewDraft(EMPTY_ENTRY);
    setAddingNew(false);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditDraft({ ...(mode === 'create' ? createLorebook[index] : lorebook[index]) });
    setAddingNew(false);
  };

  const commitEdit = () => {
    if (editingIndex === null) return;
    if (mode === 'create') {
      setCreateLorebook((prev) => prev.map((e, i) => i === editingIndex ? { ...editDraft } : e));
    } else {
      setLorebook((prev) => prev.map((e, i) => i === editingIndex ? { ...editDraft } : e));
    }
    setEditingIndex(null);
  };

  const removeEntry = (index: number) => {
    if (mode === 'create') {
      setCreateLorebook((prev) => prev.filter((_, i) => i !== index));
    } else {
      const entry = lorebook[index];
      if (entry.id) setDeletedIds((prev) => [...prev, entry.id!]);
      setLorebook((prev) => prev.filter((_, i) => i !== index));
    }
    if (editingIndex === index) setEditingIndex(null);
  };

  const isValid = form.name.trim() !== '' && (mode !== 'create' || (form.description.trim() !== '' && form.adventureStart.trim() !== ''));

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleImageRemove = async () => {
    if (!adventureId) return;
    await api.adventure.removeImage(adventureId);
    setImageUrl(null);
    setImageFile(null);
  };

  const handleImageGenerate = async () => {
    const prompt = buildImagePrompt({
      name: form.name,
      description: form.description,
      adventureStart: form.adventureStart,
    });
    const blob = await api.imageGenerations.generate(prompt);
    const file = new File([blob], 'generated.png', { type: 'image/png' });
    setImageFile(file);
    setImageUrl(URL.createObjectURL(blob));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    if (!isValid) return;
    setSaving(true);

    try {
      if (mode === 'create') {
        const body = {
          name: form.name,
          description: form.description,
          worldId: form.worldId,
          narratorName: form.narratorName || null,
          narratorPersonality: form.narratorPersonality || null,
          visibility: form.visibility,
          moderation: form.moderation,
          isMultiplayer: false,
          adventureStart: form.adventureStart,
          lorebook: createLorebook.map((e) => ({
            name: e.name,
            description: e.description,
            playerId: e.playerId || null,
          })),
          uiImagePositionX,
          uiImagePositionY,
          permissions: [],
          modelConfiguration: form.modelConfiguration,
          contextAttributes: form.contextAttributes,
        };
        const res = await apiFetch('/api/adventure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await extractApiError(res) ?? t('form.errors.saveFailed'));
        const data = await res.json();
        const id = data.id;
        if (imageFile) {
          const uploadRes = await api.adventure.uploadImage(id, imageFile);
          if (!uploadRes.ok) throw new Error(await extractApiError(uploadRes) ?? t('form.errors.saveFailed'));
        } else {
          const prompt = buildImagePrompt({
            name: form.name,
            description: form.description,
            adventureStart: form.adventureStart,
          });
          const blob = await api.imageGenerations.generate(prompt);
          const file = new File([blob], 'generated.png', { type: 'image/png' });
          const uploadRes = await api.adventure.uploadImage(id, file);
          if (!uploadRes.ok) throw new Error(await extractApiError(uploadRes) ?? t('form.errors.saveFailed'));
        }
        window.dispatchEvent(new Event('adventure-list-changed'));
        navigate(`/adventure/play/${id}`);
      } else {
        const body = {
          name: form.name,
          description: form.description,
          narratorName: form.narratorName || null,
          narratorPersonality: form.narratorPersonality || null,
          visibility: form.visibility,
          moderation: form.moderation,
          isMultiplayer: false,
          adventureStart: form.adventureStart,
          permissions: [],
          modelConfiguration: form.modelConfiguration,
          contextAttributes: form.contextAttributes,
          uiImagePositionX,
          uiImagePositionY,
        };
        const updateRes = await apiFetch(`/api/adventure/${adventureId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...body,
            lorebookEntriesToAdd: lorebook
              .filter((e) => !e.id)
              .map(({ name, description, playerId }) => ({ name, description, playerId: playerId || null })),
            lorebookEntriesToUpdate: lorebook
              .filter((e) => !!e.id)
              .map(({ id, name, description, playerId }) => ({ id, name, description, playerId: playerId || null })),
            lorebookEntriesToDelete: deletedIds,
          }),
        });
        if (!updateRes.ok) throw new Error(await extractApiError(updateRes) ?? t('form.errors.saveFailed'));
        navigate(`/adventure/${adventureId}/view`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('form.errors.saveFailed'));
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">{t('page.loading')}</div>;
  }

  const activeLorebook = mode === 'create' ? createLorebook : lorebook;

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            <div className="flex items-center gap-2">
              {mode === 'create' && (
                <label className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted">
                  {t('form.actions.importJson')}
                  <input type="file" accept=".json" className="sr-only" onChange={handleJsonImport} />
                </label>
              )}
              <button type="button" onClick={() => navigate(-1)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                {t('form.actions.back')}
              </button>
            </div>
          </div>

          {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

          <EntityBanner
            imageUrl={imageUrl}
            name={form.name}
            mode={mode}
            canGenerate={mode !== 'view' && !!form.name && !!form.description}
            uiImagePositionX={uiImagePositionX}
            uiImagePositionY={uiImagePositionY}
            onUiImagePositionChange={(x, y) => { setUiImagePositionX(x); setUiImagePositionY(y); }}
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            onGenerate={handleImageGenerate}
          />

          <div className="flex flex-col gap-5 rounded-md border border-border p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('form.sections.basicData')}</span>

            {mode !== 'view' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('form.fields.name')}</label>
              <input type="text" value={form.name} onChange={set('name')} disabled={readOnly} className={`${INPUT_CLASS}${errorBorder(form.name)}`} />
            </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('form.fields.description')}</label>
              <textarea rows={4} value={form.description} onChange={set('description')} disabled={readOnly} className={`${TEXTAREA_CLASS}${errorBorder(form.description, mode === 'create')}`} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('form.fields.adventureStart')}</label>
              <textarea rows={6} value={form.adventureStart} onChange={set('adventureStart')} disabled={readOnly} className={`${TEXTAREA_CLASS}${errorBorder(form.adventureStart, mode === 'create')}`} />
            </div>
          </div>

          {mode !== 'edit' && (
            <div className="flex flex-col gap-5 rounded-md border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('form.fields.world')}
                  <Tooltip content={t('form.tooltips.world')} position="top" className="normal-case"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
                </span>
                {!readOnly && (
                  <div className="flex items-center gap-2">
                    {form.worldId !== null && (
                      <button
                        type="button"
                        onClick={() => handleWorldChange(null)}
                        className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        {t('form.actions.clearWorld')}
                      </button>
                    )}
                    <input
                      type="text"
                      value={worldFilter}
                      onChange={(e) => { setWorldFilter(e.target.value); setWorldPage(1); }}
                      placeholder={t('form.placeholders.filterWorlds')}
                      className="w-48 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                )}
              </div>
              {readOnly ? (
                worldName ? (
                  <a href={`/world/${form.worldId}/view`} className="text-sm text-primary underline">
                    {worldName}
                  </a>
                ) : null
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWorldPage((p) => p - 1)}
                    disabled={worldPage === 1}
                    className={`shrink-0 rounded-md p-1 transition-colors ${worldPage === 1 ? 'cursor-default text-muted-foreground/40' : 'text-foreground hover:bg-muted'}`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <CardPicker
                      options={worlds}
                      value={form.worldId}
                      onChange={handleWorldChange}
                      readOnly={false}
                      emptyText={t('form.empty.noWorlds')}
                      viewBasePath="/world"
                      onView={handleWorldView}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setWorldPage((p) => p + 1)}
                    disabled={worldPage >= worldTotalPages}
                    className={`shrink-0 rounded-md p-1 transition-colors ${worldPage >= worldTotalPages ? 'cursor-default text-muted-foreground/40' : 'text-foreground hover:bg-muted'}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-5 rounded-md border border-border p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('form.sections.storyNarration')}</span>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {t('form.fields.narratorName')}
                <Tooltip content={t('form.tooltips.narratorName')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
                <span className="text-xs text-muted-foreground">({t('form.optional')})</span>
              </label>
              <input
                type="text"
                value={form.narratorName}
                onChange={set('narratorName')}
                disabled={readOnly}
                className={INPUT_CLASS}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {t('form.fields.narratorPersonality')}
                <Tooltip content={t('form.tooltips.narratorPersonality')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
                <span className="text-xs text-muted-foreground">({t('form.optional')})</span>
              </label>
              <textarea
                rows={4}
                value={form.narratorPersonality}
                onChange={set('narratorPersonality')}
                disabled={readOnly}
                className={TEXTAREA_CLASS}
              />
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-md border border-border p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('form.sections.visibilityControl')}</span>

            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {t('form.fields.visibility')}
                  <Tooltip content={t('form.tooltips.visibility')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
                </label>
                <select value={form.visibility} onChange={set('visibility')} disabled={readOnly} className={INPUT_CLASS}>
                  <option value="PUBLIC">{t('form.options.public')}</option>
                  <option value="PRIVATE">{t('form.options.private')}</option>
                </select>
              </div>

              <div className="flex flex-1 flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {t('form.fields.moderation')}
                  <Tooltip content={t('form.tooltips.moderation')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
                </label>
                <select value={form.moderation} onChange={set('moderation')} disabled={readOnly} className={INPUT_CLASS}>
                  <option value="STRICT">{t('form.options.strict')}</option>
                  <option value="PERMISSIVE">{t('form.options.permissive')}</option>
                  <option value="DISABLED">{t('form.options.disabled')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-md border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('form.sections.lorebook')}</span>
              {!readOnly && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={lorebookFilter}
                    onChange={(e) => setLorebookFilter(e.target.value)}
                    placeholder={t('form.placeholders.filterLorebook')}
                    className="w-40 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  {activeLorebook.length > 0 && !addingNew && editingIndex === null && (
                    <button
                      type="button"
                      onClick={() => {
                        if (mode === 'create') setCreateLorebook([]);
                        else setLorebook([]);
                        setLorebookFilter('');
                      }}
                      className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      {t('form.actions.clearLorebook')}
                    </button>
                  )}
                  {!addingNew && editingIndex === null && (
                    <button
                      type="button"
                      onClick={() => setAddingNew(true)}
                      className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t('form.actions.addEntry')}
                    </button>
                  )}
                </div>
              )}
            </div>

            {addingNew && (
              <LorebookEntryForm
                value={newDraft}
                onChange={setNewDraft}
                onDone={commitNew}
                onCancel={() => { setAddingNew(false); setNewDraft(EMPTY_ENTRY); }}
                namePlaceholder={t('form.placeholders.name')}
                descriptionPlaceholder={t('form.placeholders.description')}
                playerIdPlaceholder={t('form.placeholders.playerId')}
                doneLabel={t('form.actions.done')}
                cancelLabel={t('form.actions.cancel')}
              />
            )}

            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {activeLorebook.length === 0 && !addingNew && (
                <p className="text-sm text-muted-foreground">{t('form.empty.noLorebook')}</p>
              )}

              {activeLorebook.map((entry, i) => ({ entry, i })).filter(({ entry }) => !lorebookFilter || entry.name.toLowerCase().includes(lorebookFilter.toLowerCase())).map(({ entry, i }) =>
                editingIndex === i ? (
                  <LorebookEntryForm
                    key={i}
                    value={editDraft}
                    onChange={setEditDraft}
                    onDone={commitEdit}
                    onCancel={() => setEditingIndex(null)}
                    namePlaceholder={t('form.placeholders.name')}
                    descriptionPlaceholder={t('form.placeholders.description')}
                    playerIdPlaceholder={t('form.placeholders.playerId')}
                    doneLabel={t('form.actions.done')}
                    cancelLabel={t('form.actions.cancel')}
                  />
                ) : (
                  <div key={i} className="flex items-start justify-between gap-3 rounded-md border border-border px-4 py-3">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium text-foreground">{entry.name}</span>
                      <span className="line-clamp-2 text-sm text-muted-foreground">{entry.description}</span>
                      {entry.playerId && (
                        <span className="text-xs text-muted-foreground">{t('form.player')}{entry.playerId}</span>
                      )}
                    </div>
                    {!readOnly && (
                      <div className="flex shrink-0 gap-1">
                        <button type="button" onClick={() => startEdit(i)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => removeEntry(i)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setAdvancedOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              {t('form.actions.advanced')}
              {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {advancedOpen && (
              <div className="flex flex-col gap-5 rounded-md border border-border p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('form.fields.modelConfiguration')}</span>

                <div className="flex gap-4">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      {t('form.fields.aiModel')}
                      <Tooltip content={t('form.tooltips.aiModel')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
                    </label>
                    <select value={form.modelConfiguration.aiModel} onChange={setModel('aiModel')} disabled={readOnly} className={INPUT_CLASS}>
                      <option value="GPT54">GPT-5.4</option>
                      <option value="GPT54_MINI">GPT-5.4 Mini</option>
                      <option value="GPT54_NANO">GPT-5.4 Nano</option>
                    </select>
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      {t('form.fields.maxTokenLimit')}
                      <Tooltip content={t('form.tooltips.maxTokenLimit')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
                    </label>
                    <input type="number" min={100} value={form.modelConfiguration.maxTokenLimit} onChange={setModel('maxTokenLimit')} disabled={readOnly} className={INPUT_CLASS} />
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      {t('form.fields.temperature')}
                      <Tooltip content={t('form.tooltips.temperature')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
                    </label>
                    <input type="number" min={0.1} max={2.0} step={0.1} value={form.modelConfiguration.temperature} onChange={setModel('temperature')} disabled={readOnly} className={INPUT_CLASS} />
                  </div>
                </div>

                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('form.fields.contextAttributes')}</span>

                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {t('form.fields.nudge')}
                    <Tooltip content={t('form.tooltips.nudge')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
                  </label>
                  <textarea rows={3} value={form.contextAttributes.nudge} onChange={setCtx('nudge')} disabled={readOnly} className={TEXTAREA_CLASS} />
                </div>


                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {t('form.fields.bump')}
                    <Tooltip content={t('form.tooltips.bump')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
                  </label>
                  <textarea rows={3} value={form.contextAttributes.bump} onChange={setCtx('bump')} disabled={readOnly} className={TEXTAREA_CLASS} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {t('form.fields.bumpFrequency')}
                    <Tooltip content={t('form.tooltips.bumpFrequency')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
                  </label>
                  <input type="number" value={form.contextAttributes.bumpFrequency} onChange={setCtx('bumpFrequency')} disabled={readOnly} className={INPUT_CLASS} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!readOnly && (
        <div className="border-t border-border bg-background px-6 py-4">
          <div className="mx-auto flex w-full max-w-5xl gap-3">
            <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? t('form.actions.saving') : t('form.actions.save')}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
              {t('form.actions.cancel')}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
