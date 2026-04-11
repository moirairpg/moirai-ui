import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Info, Pencil, Plus, Trash2 } from 'lucide-react';
import type { AdventureDetails, ModelConfiguration, ContextAttributes } from '../../sidebar/types';
import { apiFetch } from '../../../utils/api';
import { Tooltip } from '../../../shared/view/ui';

type AdventureFormPageProps = { mode: 'view' | 'edit' | 'create' };

type SelectOption = { id: string; name: string };

type LorebookEntry = { id?: string; name: string; description: string; playerId: string };

type FormState = {
  name: string;
  description: string;
  worldId: string;
  personaId: string;
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
  worldId: '',
  personaId: '',
  visibility: 'PUBLIC',
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
}: {
  options: SelectOption[];
  value: string;
  onChange: (id: string) => void;
  readOnly: boolean;
  emptyText: string;
}) {
  if (readOnly) {
    const selected = options.find((o) => o.id === value);
    return (
      <div className={`${INPUT_CLASS} cursor-not-allowed opacity-50`}>{selected?.name ?? '—'}</div>
    );
  }

  if (options.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`min-w-[160px] rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors ${
            value === option.id
              ? 'border-primary bg-primary/10 text-foreground'
              : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {option.name}
        </button>
      ))}
    </div>
  );
}

const INPUT_CLASS = 'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50';
const TEXTAREA_CLASS = `resize-none ${INPUT_CLASS}`;

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
  const { adventureId } = useParams<{ adventureId: string }>();
  const { t } = useTranslation('adventure');
  const [form, setForm] = useState<FormState>(EMPTY);
  const [worlds, setWorlds] = useState<SelectOption[]>([]);
  const [personas, setPersonas] = useState<SelectOption[]>([]);
  const [lorebook, setLorebook] = useState<LorebookEntry[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [addingNew, setAddingNew] = useState(false);
  const [newDraft, setNewDraft] = useState<LorebookEntry>(EMPTY_ENTRY);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<LorebookEntry>(EMPTY_ENTRY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const readOnly = mode === 'view';
  const title = mode === 'create' ? t('form.title.new') : mode === 'edit' ? t('form.title.edit') : t('form.title.fallback');

  useEffect(() => {
    const fetches: Promise<void>[] = [
      apiFetch('/api/world?view=MY_STUFF&size=100').then((r) => r.json()).then((d) => setWorlds(d.data ?? [])),
      apiFetch('/api/persona?view=MY_STUFF&size=100').then((r) => r.json()).then((d) => setPersonas(d.data ?? [])),
    ];

    if (mode !== 'create' && adventureId) {
      fetches.push(
        apiFetch(`/api/adventure/${adventureId}`)
          .then((r) => r.json())
          .then((data: AdventureDetails) => {
            setForm({
              name: data.name,
              description: data.description,
              worldId: data.worldId,
              personaId: data.personaId,
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

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setModel = (field: keyof ModelConfiguration) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, modelConfiguration: { ...prev.modelConfiguration, [field]: field === 'aiModel' ? e.target.value : Number(e.target.value) } }));

  const setCtx = (field: keyof ContextAttributes) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, contextAttributes: { ...prev.contextAttributes, [field]: field === 'bumpFrequency' ? Number(e.target.value) : e.target.value } }));

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (mode === 'create') {
        const body = {
          name: form.name,
          description: form.description,
          worldId: form.worldId,
          personaId: form.personaId,
          visibility: form.visibility,
          moderation: form.moderation,
          isMultiplayer: form.isMultiplayer,
          permissions: [],
          modelConfiguration: form.modelConfiguration,
          contextAttributes: form.contextAttributes,
        };
        const res = await apiFetch('/api/adventure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        navigate(`/adventure/${data.id}/view`);
      } else {
        const body = {
          name: form.name,
          description: form.description,
          worldId: form.worldId,
          personaId: form.personaId,
          visibility: form.visibility,
          moderation: form.moderation,
          isMultiplayer: form.isMultiplayer,
          adventureStart: form.adventureStart,
          permissions: [],
          modelConfiguration: form.modelConfiguration,
          contextAttributes: form.contextAttributes,
        };
        await apiFetch(`/api/adventure/${adventureId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        await Promise.all([
          ...deletedIds.map((id) =>
            apiFetch(`/api/adventure/${adventureId}/lorebook/${id}`, { method: 'DELETE' })
          ),
          ...lorebook
            .filter((e) => !e.id)
            .map((e) =>
              apiFetch(`/api/adventure/${adventureId}/lorebook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: e.name, description: e.description, playerId: e.playerId || null }),
              })
            ),
          ...lorebook
            .filter((e) => !!e.id)
            .map((e) =>
              apiFetch(`/api/adventure/${adventureId}/lorebook/${e.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: e.name, description: e.description, playerId: e.playerId || null }),
              })
            ),
        ]);

        navigate(`/adventure/${adventureId}/view`);
      }
    } catch {
      setError(t('form.errors.saveFailed'));
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">{t('page.loading')}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto w-full max-w-5xl flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            <button type="button" onClick={() => navigate(-1)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
              {t('form.actions.back')}
            </button>
          </div>

          {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">{t('form.fields.name')}</label>
            <input type="text" value={form.name} onChange={set('name')} disabled={readOnly} className={INPUT_CLASS} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">{t('form.fields.description')}</label>
            <textarea rows={4} value={form.description} onChange={set('description')} disabled={readOnly} className={TEXTAREA_CLASS} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">{t('form.fields.world')}</label>
            <CardPicker
              options={worlds}
              value={form.worldId}
              onChange={(id) => setForm((prev) => ({ ...prev, worldId: id }))}
              readOnly={readOnly}
              emptyText={t('form.empty.noWorlds')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">{t('form.fields.persona')}</label>
            <CardPicker
              options={personas}
              value={form.personaId}
              onChange={(id) => setForm((prev) => ({ ...prev, personaId: id }))}
              readOnly={readOnly}
              emptyText={t('form.empty.noPersonas')}
            />
          </div>

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

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input type="checkbox" checked={form.isMultiplayer} onChange={set('isMultiplayer')} disabled={readOnly} className="h-4 w-4" />
              {t('form.fields.multiplayer')}
            </label>
          </div>

          {mode !== 'create' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('form.fields.adventureStart')}</label>
              <textarea rows={6} value={form.adventureStart} onChange={set('adventureStart')} disabled={readOnly} className={TEXTAREA_CLASS} />
            </div>
          )}

          {mode !== 'create' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{t('form.fields.lorebook')}</span>
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
                  playerIdPlaceholder={t('form.placeholders.playerId')}
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
                      playerIdPlaceholder={t('form.placeholders.playerId')}
                      doneLabel={t('form.actions.done')}
                      cancelLabel={t('form.actions.cancel')}
                    />
                  ) : (
                    <div key={i} className="flex items-start justify-between gap-3 rounded-md border border-border px-4 py-3">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">{entry.name}</span>
                        <span className="text-sm text-muted-foreground line-clamp-2">{entry.description}</span>
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
          )}

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
