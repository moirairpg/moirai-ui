import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Info, Pencil, Trash2, Plus } from 'lucide-react';
import type { WorldDetails } from '../../sidebar/types';
import { apiFetch } from '../../../utils/api';
import { Tooltip } from '../../../shared/view/ui';
import { useJsonImport, parseWorldJson } from '../../../utils/jsonImport';

type WorldFormPageProps = { mode: 'view' | 'edit' | 'create' };

type LorebookEntry = { id?: string; name: string; description: string };

type FormState = {
  name: string;
  description: string;
  adventureStart: string;
  visibility: string;
  narratorName: string;
  narratorPersonality: string;
};

const EMPTY: FormState = { name: '', description: '', adventureStart: '', visibility: 'PRIVATE', narratorName: '', narratorPersonality: '' };
const EMPTY_ENTRY: LorebookEntry = { name: '', description: '' };

const INPUT_CLASS = 'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50';
const TEXTAREA_CLASS = `resize-none ${INPUT_CLASS}`;

function LorebookEntryForm({
  value,
  onChange,
  onDone,
  onCancel,
  namePlaceholder,
  descriptionPlaceholder,
  doneLabel,
  cancelLabel,
}: {
  value: LorebookEntry;
  onChange: (entry: LorebookEntry) => void;
  onDone: () => void;
  onCancel: () => void;
  namePlaceholder: string;
  descriptionPlaceholder: string;
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

export default function WorldFormPage({ mode }: WorldFormPageProps) {
  const navigate = useNavigate();
  const { worldId } = useParams<{ worldId: string }>();
  const { t } = useTranslation('world');
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

  const readOnly = mode === 'view';
  const title = mode === 'create' ? t('form.title.new') : mode === 'edit' ? t('form.title.edit') : t('form.title.fallback');

  useEffect(() => {
    if (mode === 'create') return;
    apiFetch(`/api/world/${worldId}`)
      .then((r) => r.json())
      .then((data: WorldDetails) => {
        setForm({ name: data.name, description: data.description, adventureStart: data.adventureStart, visibility: data.visibility, narratorName: data.narratorName ?? '', narratorPersonality: data.narratorPersonality ?? '' });
        setLorebook((data.lorebook ?? []).map((e) => ({ id: e.id, name: e.name, description: e.description })));
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
    if (data.lorebook.length) setLorebook(data.lorebook.map(({ name, description }) => ({ name, description })));
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const baseBody = {
        name: form.name,
        description: form.description,
        adventureStart: form.adventureStart,
        visibility: form.visibility,
        narratorName: form.narratorName || null,
        narratorPersonality: form.narratorPersonality || null,
        permissions: [],
      };

      if (mode === 'create') {
        const res = await apiFetch('/api/world', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...baseBody, lorebook: lorebook.map(({ name, description }) => ({ name, description })) }),
        });
        const data = await res.json();
        navigate(`/world/${data.id}/view`);
      } else {
        await apiFetch(`/api/world/${worldId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(baseBody),
        });

        await Promise.all([
          ...deletedIds.map((id) =>
            apiFetch(`/api/world/${worldId}/lorebook/${id}`, { method: 'DELETE' })
          ),
          ...lorebook
            .filter((e) => !e.id)
            .map((e) =>
              apiFetch(`/api/world/${worldId}/lorebook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: e.name, description: e.description }),
              })
            ),
          ...lorebook
            .filter((e) => !!e.id)
            .map((e) =>
              apiFetch(`/api/world/${worldId}/lorebook/${e.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: e.name, description: e.description }),
              })
            ),
        ]);

        navigate(`/world/${worldId}/view`);
      }
    } catch {
      setError(t('form.errors.saveFailed'));
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">{t('form.loading')}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto w-full max-w-5xl flex flex-col gap-5">
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

          <div className="flex flex-col gap-5 rounded-md border border-border p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('form.sections.basicData')}</span>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('form.fields.name')}</label>
              <input type="text" value={form.name} onChange={set('name')} disabled={readOnly} className={INPUT_CLASS} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('form.fields.description')}</label>
              <textarea rows={4} value={form.description} onChange={set('description')} disabled={readOnly} className={TEXTAREA_CLASS} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {t('form.fields.adventureStart')}
                <Tooltip content={t('form.tooltips.adventureStart')} position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
              </label>
              <textarea rows={6} value={form.adventureStart} onChange={set('adventureStart')} disabled={readOnly} className={TEXTAREA_CLASS} />
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
          </div>

          <div className="flex flex-col gap-5 rounded-md border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('form.sections.lorebook')}</span>
              {!readOnly && !addingNew && editingIndex === null && (
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

            <div className="flex flex-col gap-2 overflow-y-auto max-h-64">
              {lorebook.length === 0 && !addingNew && (
                <p className="text-sm text-muted-foreground">{t('form.empty.noLorebook')}</p>
              )}

              {lorebook.map((entry, i) =>
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
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">{entry.name}</span>
                      <span className="text-sm text-muted-foreground line-clamp-2">{entry.description}</span>
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
          <div className="mx-auto w-full max-w-5xl flex gap-3">
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
