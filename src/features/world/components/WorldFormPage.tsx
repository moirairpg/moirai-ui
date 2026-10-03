import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Info, Pencil, Trash2, Plus, Loader2, Upload } from 'lucide-react';
import type { WorldDetails } from '../../sidebar/types';
import { apiFetch, apiPath, api, extractApiError, notifyError, notifySuccess } from '../../../utils/api';
import { EntityBanner, Tooltip } from '../../../shared/view/ui';
import { LorebookEntryForm } from '../../../shared/components/LorebookEntryForm';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { AssetMembersSection } from '../../../shared/components/AssetMembersSection';
import { useAssetMembers } from '../../../shared/hooks/useAssetMembers';
import { useAuth } from '../../../components/auth';
import { EMPTY_LOREBOOK_ENTRY as EMPTY_ENTRY, type LorebookEntry } from '../../../shared/types/lorebook';
import { useJsonImport, parseWorldJson, parseLorebookJson, mergeLorebookEntries, hasDuplicateLorebookEntries } from '../../../utils/jsonImport';
import { buildImagePrompt } from '../../../utils/imagePrompt';
import { resolveImagePosition } from '../../../utils/imagePosition';

type WorldFormPageProps = { mode: 'view' | 'edit' | 'create' };

type FormState = {
  name: string;
  description: string;
  adventureStart: string;
  visibility: string;
  narratorName: string;
  narratorPersonality: string;
};

const EMPTY: FormState = { name: '', description: '', adventureStart: '', visibility: 'PRIVATE', narratorName: '', narratorPersonality: '' };

const assetSignatureOf = (form: FormState, lorebook: LorebookEntry[], deletedIds: string[], x: number, y: number) =>
  JSON.stringify({ ...form, visibility: '', lorebook, deletedIds, x, y });

const INPUT_CLASS = 'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50';
const TEXTAREA_CLASS = `resize-y ${INPUT_CLASS}`;

export default function WorldFormPage({ mode }: WorldFormPageProps) {
  const navigate = useNavigate();
  const { worldId } = useParams<{ worldId: string }>();
  const { t } = useTranslation('world');
  const { user } = useAuth();
  const [canManage, setCanManage] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [lorebook, setLorebook] = useState<LorebookEntry[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [addingNew, setAddingNew] = useState(false);
  const [newDraft, setNewDraft] = useState<LorebookEntry>(EMPTY_ENTRY);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<LorebookEntry>(EMPTY_ENTRY);
  const [loading, setLoading] = useState(mode !== 'create');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [imagePromptOpen, setImagePromptOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uiImagePositionX, setUiImagePositionX] = useState(0.5);
  const [uiImagePositionY, setUiImagePositionY] = useState(0.5);
  const [submitted, setSubmitted] = useState(false);
  const [lorebookFilter, setLorebookFilter] = useState('');
  const [savedAssetSignature, setSavedAssetSignature] = useState('');
  const [savedVisibility, setSavedVisibility] = useState('PRIVATE');

  const readOnly = mode === 'view';
  const isAdmin = user?.role === 'ADMIN';
  const canEdit = mode === 'view' && (canManage || isAdmin);
  const canDelete = mode !== 'create' && (isOwner || isAdmin);
  const canManageAccess = isOwner || isAdmin;
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const {
    members,
    isLoading: membersLoading,
    error: membersError,
    hasUnsavedChanges: hasMemberChanges,
    addMember,
    changeLevel,
    removeMember,
    save: saveMembers,
  } = useAssetMembers('worlds', worldId, mode !== 'create' && canManageAccess);

  const hasAssetChanges = assetSignatureOf(form, lorebook, deletedIds, uiImagePositionX, uiImagePositionY) !== savedAssetSignature;
  const hasImageChanges = imageFile !== null;
  const hasAccessChanges = hasMemberChanges || form.visibility !== savedVisibility;
  const canSave = mode === 'create' || hasAssetChanges || hasImageChanges || (canManageAccess && hasAccessChanges);

  const handleDelete = async () => {
    setConfirmingDelete(false);
    const res = await apiFetch(apiPath`/api/worlds/${worldId}`, { method: 'DELETE' });
    if (res.ok) {
      notifySuccess(t('toast.deleted', { ns: 'common' }));
      navigate('/my-stuff');
    }
  };

  const hasDuplicateEntries = hasDuplicateLorebookEntries(lorebook);

  const isValid = form.name.trim() !== '' && form.description.trim() !== '' && form.adventureStart.trim() !== '' && !hasDuplicateEntries;
  const errorBorder = (value: string) => submitted && !value.trim() ? ' border-red-500' : '';
  const title = mode === 'create' ? t('form.title.new') : mode === 'edit' ? t('form.title.edit') : t('form.title.fallback');

  useEffect(() => {
    setSaving(false);
    setSubmitted(false);
    setError('');
    setLorebookFilter('');
    setDeletedIds([]);
    setCanManage(false);
    setIsOwner(false);
    setImageFile(null);
    setAddingNew(false);
    setNewDraft(EMPTY_ENTRY);
    setEditingIndex(null);
    setEditDraft(EMPTY_ENTRY);
    setSavedAssetSignature('');
    setSavedVisibility('PRIVATE');
    if (mode === 'create') {
      setForm(EMPTY);
      setLorebook([]);
      setImageUrl(null);
      setUiImagePositionX(0.5);
      setUiImagePositionY(0.5);
      return;
    }
    setForm(EMPTY);
    setLorebook([]);
    setImageUrl(null);
    setUiImagePositionX(0.5);
    setUiImagePositionY(0.5);
    setLoading(true);
    apiFetch(apiPath`/api/worlds/${worldId}`)
      .then((r) => r.json())
      .then((data: WorldDetails) => {
        const loadedForm: FormState = { name: data.name, description: data.description, adventureStart: data.adventureStart, visibility: data.visibility, narratorName: data.narratorName ?? '', narratorPersonality: data.narratorPersonality ?? '' };
        const loadedLorebook = (data.lorebook ?? []).map((e) => ({ id: e.id, name: e.name, description: e.description }));

        setForm(loadedForm);
        setLorebook(loadedLorebook);
        setImageUrl(data.imageUrl ?? null);
        setUiImagePositionX(data.uiImagePositionX ?? 0.5);
        setUiImagePositionY(data.uiImagePositionY ?? 0.5);
        setCanManage(data.canManage);
        setIsOwner(data.isOwner);
        setSavedAssetSignature(assetSignatureOf(loadedForm, loadedLorebook, [], data.uiImagePositionX ?? 0.5, data.uiImagePositionY ?? 0.5));
        setSavedVisibility(data.visibility);
        setLoading(false);
      })
      .catch(() => {
        setError(t('form.errors.loadFailed'));
        setLoading(false);
      });
  }, [mode, worldId]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const commitNew = () => {
    setLorebook((prev) => [...prev, { ...newDraft }]);
    setNewDraft(EMPTY_ENTRY);
    setAddingNew(false);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditDraft({ ...lorebook[index] });
    setAddingNew(false);
  };

  const commitEdit = () => {
    if (editingIndex === null) return;
    setLorebook((prev) => prev.map((e, i) => i === editingIndex ? { ...editDraft } : e));
    setEditingIndex(null);
  };

  const removeEntry = (index: number) => {
    const entry = lorebook[index];
    if (entry.id) setDeletedIds((prev) => [...prev, entry.id!]);
    setLorebook((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleJsonImport = useJsonImport((raw) => {
    const data = parseWorldJson(raw);
    setForm((prev) => ({
      ...prev,
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.adventureStart && { adventureStart: data.adventureStart }),
      ...(data.visibility && { visibility: data.visibility }),
      ...(data.narratorName && { narratorName: data.narratorName }),
      ...(data.narratorPersonality && { narratorPersonality: data.narratorPersonality }),
    }));
    if (data.lorebook.length) setLorebook(mergeLorebookEntries([], data.lorebook.map(({ name, description }) => ({ name, description }))));
  });

  const handleLorebookImport = useJsonImport((raw) => {
    const entries = parseLorebookJson(raw);
    if (!entries.length) return;
    setLorebook((prev) => mergeLorebookEntries(prev, entries.map(({ name, description }) => ({ name, description }))));
  });

  const handleImageUpload = async (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    const position = await resolveImagePosition(file);
    setUiImagePositionX(position.x);
    setUiImagePositionY(position.y);
  };

  const handleImageRemove = async () => {
    if (worldId) {
      await api.world.removeImage(worldId);
    }
    setImageUrl(null);
    setImageFile(null);
  };

  const handleImageGenerate = async () => {
    const prompt = buildImagePrompt({
      subject: 'world',
      fields: [
        { label: 'Name', value: form.name },
        { label: 'Description', value: form.description },
        { label: 'Adventure Start', value: form.adventureStart },
      ],
      lorebook: { entries: lorebook, text: `${form.description}\n${form.adventureStart}` },
    });
    const blob = await api.imageGenerations.generate(prompt);
    const file = new File([blob], 'generated.png', { type: 'image/png' });
    setImageFile(file);
    setImageUrl(URL.createObjectURL(blob));
    const position = await resolveImagePosition(file);
    setUiImagePositionX(position.x);
    setUiImagePositionY(position.y);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');

    if (!isValid) return;
    if (mode !== 'create' && !canSave) return;

    if (mode === 'create' && !imageFile && !imageUrl) {
      setImagePromptOpen(true);
      return;
    }

    await submitWorld(false);
  };

  const submitWorld = async (shouldGenerateImage: boolean) => {
    setSaving(true);

    try {
      const baseBody = {
        name: form.name,
        description: form.description,
        adventureStart: form.adventureStart,
        narratorName: form.narratorName || null,
        narratorPersonality: form.narratorPersonality || null,
        uiImagePositionX,
        uiImagePositionY,
      };

      if (mode === 'create') {
        const res = await apiFetch('/api/worlds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...baseBody, visibility: form.visibility, lorebook: lorebook.map(({ name, description }) => ({ name, description })) }),
          silent: true,
        });
        if (!res.ok) throw new Error(await extractApiError(res) ?? t('form.errors.saveFailed'));
        const data = await res.json();
        const id = data.id;
        if (imageFile) {
          const uploadRes = await api.world.uploadImage(id, imageFile, { silent: true });
          if (!uploadRes.ok) throw new Error(await extractApiError(uploadRes) ?? t('form.errors.saveFailed'));
        } else if (shouldGenerateImage) {
          const prompt = buildImagePrompt({
            subject: 'world',
            fields: [
              { label: 'Name', value: form.name },
              { label: 'Description', value: form.description },
              { label: 'Adventure Start', value: form.adventureStart },
            ],
            lorebook: { entries: lorebook, text: `${form.description}\n${form.adventureStart}` },
          });
          const blob = await api.imageGenerations.generate(prompt, { silent: true });
          const file = new File([blob], 'generated.png', { type: 'image/png' });
          const uploadRes = await api.world.uploadImage(id, file, { silent: true });
          if (!uploadRes.ok) throw new Error(await extractApiError(uploadRes) ?? t('form.errors.saveFailed'));
          const position = await resolveImagePosition(file);
          await apiFetch(apiPath`/api/worlds/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...baseBody, uiImagePositionX: position.x, uiImagePositionY: position.y }),
            silent: true,
          }).catch(() => {});
        }
        notifySuccess(t('toast.saved', { ns: 'common' }));
        navigate(`/world/${id}/view`);
      } else {
        let allSaved = true;

        if (hasAssetChanges) {
          const updateRes = await apiFetch(apiPath`/api/worlds/${worldId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...baseBody,
              lorebookEntriesToAdd: lorebook
                .filter((e) => !e.id)
                .map(({ name, description }) => ({ name, description })),
              lorebookEntriesToUpdate: lorebook
                .filter((e) => !!e.id)
                .map(({ id, name, description }) => ({ id, name, description })),
              lorebookEntriesToDelete: deletedIds,
            }),
            silent: true,
          });

          if (updateRes.ok) {
            setDeletedIds([]);
            setSavedAssetSignature(assetSignatureOf(form, lorebook, [], uiImagePositionX, uiImagePositionY));
          } else {
            allSaved = false;
            notifyError(await extractApiError(updateRes) ?? t('form.errors.saveFailed'));
          }
        }

        if (imageFile) {
          const uploadRes = await api.world.uploadImage(worldId!, imageFile, { silent: true });

          if (uploadRes.ok) setImageFile(null);
          else {
            allSaved = false;
            notifyError(await extractApiError(uploadRes) ?? t('form.errors.saveFailed'));
          }
        }

        if (canManageAccess && hasAccessChanges) {
          const accessSaved = await saveMembers(form.visibility);

          if (accessSaved) setSavedVisibility(form.visibility);
          else {
            allSaved = false;
            notifyError(t('access.errors.saveFailed', { ns: 'common' }));
          }
        }

        if (allSaved) {
          notifySuccess(t('toast.saved', { ns: 'common' }));
          navigate(`/world/${worldId}/view`);
        } else {
          setSaving(false);
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : t('form.errors.saveFailed');
      setError(message);
      notifyError(message);
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">{t('form.loading')}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-1 flex-col overflow-hidden">
      {saving && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
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
              {canEdit && (
                <button type="button" onClick={() => navigate(`/world/${worldId}/edit`)} className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <Pencil className="h-3.5 w-3.5" />
                  {t('card.actions.edit', { ns: 'collection' })}
                </button>
              )}
              {canDelete && (
                <button type="button" onClick={() => setConfirmingDelete(true)} className="flex items-center gap-1.5 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('card.actions.delete', { ns: 'collection' })}
                </button>
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
              <textarea rows={4} value={form.description} onChange={set('description')} disabled={readOnly} className={`${TEXTAREA_CLASS}${errorBorder(form.description)}`} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {t('form.fields.adventureStart')}
                <Tooltip content={t('form.tooltips.adventureStart')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
              </label>
              <textarea rows={6} value={form.adventureStart} onChange={set('adventureStart')} disabled={readOnly} className={`${TEXTAREA_CLASS}${errorBorder(form.adventureStart)}`} />
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-md border border-border p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('form.sections.storyNarration')}</span>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {t('form.fields.narratorName')}
                <Tooltip content={t('form.tooltips.narratorName')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
                <span className="text-xs text-muted-foreground">({t('form.optional')})</span>
              </label>
              <input type="text" value={form.narratorName} onChange={set('narratorName')} disabled={readOnly} className={INPUT_CLASS} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {t('form.fields.narratorPersonality')}
                <Tooltip content={t('form.tooltips.narratorPersonality')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
                <span className="text-xs text-muted-foreground">({t('form.optional')})</span>
              </label>
              <textarea rows={4} value={form.narratorPersonality} onChange={set('narratorPersonality')} disabled={readOnly} className={TEXTAREA_CLASS} />
            </div>
          </div>

          {(mode === 'create' || canManageAccess) && (
            <div className="flex flex-col gap-5 rounded-md border border-border p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('form.sections.visibilityControl')}</span>

              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {t('form.fields.visibility')}
                  <Tooltip content={t('form.tooltips.visibility')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
                </label>
                <select value={form.visibility} onChange={set('visibility')} disabled={readOnly} className={INPUT_CLASS}>
                  <option value="PUBLIC">{t('form.options.public')}</option>
                  <option value="PRIVATE">{t('form.options.private')}</option>
                </select>
              </div>

              {mode !== 'create' && worldId && canManageAccess && (
                <AssetMembersSection
                  members={members}
                  visibility={form.visibility}
                  readOnly={readOnly}
                  isLoading={membersLoading}
                  error={membersError}
                  onAdd={addMember}
                  onLevelChange={changeLevel}
                  onRemove={removeMember}
                />
              )}
            </div>
          )}

          <div className="flex flex-col gap-5 rounded-md border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('form.sections.lorebook')}</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={lorebookFilter}
                  onChange={(e) => setLorebookFilter(e.target.value)}
                  placeholder={t('form.placeholders.filterLorebook')}
                  className="w-40 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {!readOnly && (
                  <>
                    {lorebook.length > 0 && !addingNew && editingIndex === null && (
                      <button
                        type="button"
                        onClick={() => { setLorebook([]); setLorebookFilter(''); }}
                        className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        {t('form.actions.clearLorebook')}
                      </button>
                    )}
                    {!addingNew && editingIndex === null && (
                      <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted">
                        <Upload className="h-3.5 w-3.5" />
                        {t('form.actions.importLorebook')}
                        <input type="file" accept=".json" className="hidden" onChange={handleLorebookImport} />
                      </label>
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
                  </>
                )}
              </div>
            </div>

            {hasDuplicateEntries && (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {t('form.warnings.duplicateLorebook')}
              </p>
            )}

            {addingNew && (
              <LorebookEntryForm
                value={newDraft}
                onChange={setNewDraft}
                onDone={commitNew}
                onCancel={() => { setAddingNew(false); setNewDraft(EMPTY_ENTRY); }}
                namePlaceholder={t('form.placeholders.name')}
                descriptionPlaceholder={t('form.placeholders.description')}
                doneLabel={t('form.actions.done')}
                cancelLabel={t('form.actions.cancel')}
              />
            )}

            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {lorebook.length === 0 && !addingNew && (
                <p className="text-sm text-muted-foreground">{t('form.empty.noLorebook')}</p>
              )}

              {lorebook.map((entry, i) => ({ entry, i })).filter(({ entry }) => !lorebookFilter || entry.name.toLowerCase().includes(lorebookFilter.toLowerCase())).map(({ entry, i }) =>
                editingIndex === i ? (
                  <LorebookEntryForm
                    key={i}
                    value={editDraft}
                    onChange={setEditDraft}
                    onDone={commitEdit}
                    onCancel={() => setEditingIndex(null)}
                    namePlaceholder={t('form.placeholders.name')}
                    descriptionPlaceholder={t('form.placeholders.description')}
                    doneLabel={t('form.actions.done')}
                    cancelLabel={t('form.actions.cancel')}
                  />
                ) : (
                  <div key={i} className="flex items-start justify-between gap-3 rounded-md border border-border px-4 py-3">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium text-foreground">{entry.name}</span>
                      <span className="line-clamp-2 text-sm text-muted-foreground">{entry.description}</span>
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
        </div>
      </div>

      {!readOnly && (
        <div className="border-t border-border bg-background px-6 py-4">
          <div className="mx-auto flex w-full max-w-5xl gap-3">
            <button type="submit" disabled={saving || !canSave || hasDuplicateEntries} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? t('form.actions.saving') : t('form.actions.save')}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
              {t('form.actions.cancel')}
            </button>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <ConfirmDialog
          message={t('confirm.deleteWorld', { ns: 'common' })}
          onConfirm={handleDelete}
          onClose={() => setConfirmingDelete(false)}
        />
      )}

      {imagePromptOpen && (
        <ConfirmDialog
          message={t('imagePrompt.message', { ns: 'common' })}
          confirmLabel={t('imagePrompt.generate', { ns: 'common' })}
          cancelLabel={t('imagePrompt.skip', { ns: 'common' })}
          dismissLabel={t('imagePrompt.cancel', { ns: 'common' })}
          confirmVariant="primary"
          onConfirm={() => { setImagePromptOpen(false); submitWorld(true); }}
          onCancel={() => { setImagePromptOpen(false); submitWorld(false); }}
          onClose={() => setImagePromptOpen(false)}
        />
      )}
    </form>
  );
}
