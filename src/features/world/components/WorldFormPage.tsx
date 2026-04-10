import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { WorldDetails } from '../../sidebar/types';
import { apiFetch } from '../../../utils/api';

type WorldFormPageProps = { mode: 'view' | 'edit' | 'create' };

type FormState = {
  name: string;
  description: string;
  adventureStart: string;
  visibility: string;
};

const EMPTY: FormState = { name: '', description: '', adventureStart: '', visibility: 'PUBLIC' };

export default function WorldFormPage({ mode }: WorldFormPageProps) {
  const navigate = useNavigate();
  const { worldId } = useParams<{ worldId: string }>();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(mode !== 'create');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const readOnly = mode === 'view';

  const title = mode === 'create' ? 'New World' : mode === 'edit' ? 'Edit World' : 'World';

  useEffect(() => {
    if (mode === 'create') return;
    apiFetch(`/api/world/${worldId}`)
      .then((r) => r.json())
      .then((data: WorldDetails) => {
        setForm({ name: data.name, description: data.description, adventureStart: data.adventureStart, visibility: data.visibility });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load world.');
        setLoading(false);
      });
  }, [mode, worldId]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const body = { name: form.name, description: form.description, adventureStart: form.adventureStart, visibility: form.visibility, permissions: [], lorebook: [] };

      if (mode === 'create') {
        const res = await apiFetch('/api/world', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        navigate(`/world/${data.id}/view`);
      } else {
        await apiFetch(`/api/world/${worldId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        navigate(`/world/${worldId}/view`);
      }
    } catch {
      setError('Failed to save world.');
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
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              disabled={readOnly}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={set('description')}
              disabled={readOnly}
              className="resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">World Lore</label>
            <textarea
              rows={6}
              value={form.adventureStart}
              onChange={set('adventureStart')}
              disabled={readOnly}
              className="resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Visibility</label>
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
