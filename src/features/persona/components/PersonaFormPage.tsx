import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import type { PersonaDetails } from '../../sidebar/types';
import { apiFetch } from '../../../utils/api';
import { Tooltip } from '../../../shared/view/ui';

type PersonaFormPageProps = { mode: 'view' | 'edit' | 'create' };

type FormState = {
  name: string;
  personality: string;
  visibility: string;
};

const EMPTY: FormState = { name: '', personality: '', visibility: 'PUBLIC' };

export default function PersonaFormPage({ mode }: PersonaFormPageProps) {
  const navigate = useNavigate();
  const { personaId } = useParams<{ personaId: string }>();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(mode !== 'create');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const readOnly = mode === 'view';

  const title = mode === 'create' ? 'New Persona' : mode === 'edit' ? 'Edit Persona' : 'Persona';

  useEffect(() => {
    if (mode === 'create') return;
    apiFetch(`/api/persona/${personaId}`)
      .then((r) => r.json())
      .then((data: PersonaDetails) => {
        setForm({ name: data.name, personality: data.personality, visibility: data.visibility });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load persona.');
        setLoading(false);
      });
  }, [mode, personaId]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const body = { name: form.name, personality: form.personality, visibility: form.visibility };

      if (mode === 'create') {
        const res = await apiFetch('/api/persona', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        navigate(`/persona/${data.id}/view`);
      } else {
        await apiFetch(`/api/persona/${personaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        navigate(`/persona/${personaId}/view`);
      }
    } catch {
      setError('Failed to save persona.');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">Loading...</div>;
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
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
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              disabled={readOnly}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              Personality
              <Tooltip content="How this persona thinks, speaks, and behaves" position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
            </label>
            <textarea
              rows={6}
              value={form.personality}
              onChange={set('personality')}
              disabled={readOnly}
              className="resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              Visibility
              <Tooltip content="Who can see this persona" position="top"><Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" /></Tooltip>
            </label>
            <select
              value={form.visibility}
              onChange={set('visibility')}
              disabled={readOnly}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
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
