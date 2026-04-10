import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AdventureDetails, ModelConfiguration, ContextAttributes } from '../../sidebar/types';
import { apiFetch } from '../../../utils/api';

type AdventureFormPageProps = { mode: 'view' | 'edit' | 'create' };

type SelectOption = { id: string; name: string };

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
  modelConfiguration: { aiModel: 'GPT54_MINI', maxTokenLimit: 100, temperature: 1.0 },
  contextAttributes: { nudge: '', authorsNote: '', scene: '', bump: '', bumpFrequency: 0 },
};

const INPUT_CLASS = 'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50';
const TEXTAREA_CLASS = `resize-none ${INPUT_CLASS}`;

export default function AdventureFormPage({ mode }: AdventureFormPageProps) {
  const navigate = useNavigate();
  const { adventureId } = useParams<{ adventureId: string }>();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [worlds, setWorlds] = useState<SelectOption[]>([]);
  const [personas, setPersonas] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const readOnly = mode === 'view';

  const title = mode === 'create' ? 'New Adventure' : mode === 'edit' ? 'Edit Adventure' : 'Adventure';

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
          })
      );
    }

    Promise.all(fetches)
      .then(() => setLoading(false))
      .catch(() => {
        setError('Failed to load data.');
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
        navigate(`/adventure/${adventureId}/view`);
      }
    } catch {
      setError('Failed to save adventure.');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">Loading...</div>;
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <button type="button" onClick={() => navigate(-1)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
            Back
          </button>
        </div>

        {error && <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input type="text" value={form.name} onChange={set('name')} disabled={readOnly} className={INPUT_CLASS} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea rows={4} value={form.description} onChange={set('description')} disabled={readOnly} className={TEXTAREA_CLASS} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">World</label>
            <select value={form.worldId} onChange={set('worldId')} disabled={readOnly} className={INPUT_CLASS}>
              <option value="">Select a world</option>
              {worlds.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Persona</label>
            <select value={form.personaId} onChange={set('personaId')} disabled={readOnly} className={INPUT_CLASS}>
              <option value="">Select a persona</option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Visibility</label>
            <select value={form.visibility} onChange={set('visibility')} disabled={readOnly} className={INPUT_CLASS}>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Moderation</label>
            <select value={form.moderation} onChange={set('moderation')} disabled={readOnly} className={INPUT_CLASS}>
              <option value="STRICT">Strict</option>
              <option value="PERMISSIVE">Permissive</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input type="checkbox" checked={form.isMultiplayer} onChange={set('isMultiplayer')} disabled={readOnly} className="h-4 w-4" />
              Multiplayer
            </label>
          </div>

          {mode !== 'create' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Adventure Start</label>
              <textarea rows={6} value={form.adventureStart} onChange={set('adventureStart')} disabled={readOnly} className={TEXTAREA_CLASS} />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setAdvancedOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Advanced
              {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {advancedOpen && (
              <div className="flex flex-col gap-5 rounded-md border border-border p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Model Configuration</span>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">AI Model</label>
                  <select value={form.modelConfiguration.aiModel} onChange={setModel('aiModel')} disabled={readOnly} className={INPUT_CLASS}>
                    <option value="GPT54">GPT-4</option>
                    <option value="GPT54_MINI">GPT-4 Mini</option>
                    <option value="GPT54_NANO">GPT-4 Nano</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Max Token Limit</label>
                  <input type="number" min={100} value={form.modelConfiguration.maxTokenLimit} onChange={setModel('maxTokenLimit')} disabled={readOnly} className={INPUT_CLASS} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Temperature</label>
                  <input type="number" min={0.1} max={2.0} step={0.1} value={form.modelConfiguration.temperature} onChange={setModel('temperature')} disabled={readOnly} className={INPUT_CLASS} />
                </div>

                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Context Attributes</span>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Nudge</label>
                  <textarea rows={3} value={form.contextAttributes.nudge} onChange={setCtx('nudge')} disabled={readOnly} className={TEXTAREA_CLASS} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Author's Note</label>
                  <textarea rows={3} value={form.contextAttributes.authorsNote} onChange={setCtx('authorsNote')} disabled={readOnly} className={TEXTAREA_CLASS} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Scene</label>
                  <textarea rows={3} value={form.contextAttributes.scene} onChange={setCtx('scene')} disabled={readOnly} className={TEXTAREA_CLASS} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Bump</label>
                  <textarea rows={3} value={form.contextAttributes.bump} onChange={setCtx('bump')} disabled={readOnly} className={TEXTAREA_CLASS} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Bump Frequency</label>
                  <input type="number" value={form.contextAttributes.bumpFrequency} onChange={setCtx('bumpFrequency')} disabled={readOnly} className={INPUT_CLASS} />
                </div>
              </div>
            )}
          </div>

          {!readOnly && (
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
