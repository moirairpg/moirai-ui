import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronUp, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, RotateCcw } from 'lucide-react';
import { apiFetch, apiPath, api, extractApiError, notifyError, notifySuccess } from '../../../utils/api';
import { EntityBanner } from '../../../shared/view/ui';
import { buildImagePrompt } from '../../../utils/imagePrompt';
import { objectPositionOf, resolveImagePosition } from '../../../utils/imagePosition';
import { useCharacterClasses } from '../hooks/useCharacterClasses';
import { useAuth } from '../../../components/auth';
import { useCharacterAdventures } from '../hooks/useCharacterAdventures';
import { useJsonImport, parseCharacterJson } from '../../../utils/jsonImport';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useAttributeAllocation } from '../hooks/useAttributeAllocation';
import { useSkillAllocation } from '../hooks/useSkillAllocation';
import type {
  CharacterAttributes,
  CharacterFormInput,
  CharacterSignatures,
  CharacterSkills,
  PlayerCharacterDetails,
} from '../types';
import AttributeSection from './AttributeSection';
import LevelUpModal from './LevelUpModal';
import RespecModal from './RespecModal';
import SkillSection from './SkillSection';

type CharacterProgression = {
  xp: number;
  level: number;
  unspentAttributePoints: number;
  unspentSkillPoints: number;
  levelUpXpTarget: number;
};

type CharacterFormPageProps = { mode: 'view' | 'edit' | 'create' };

const INPUT_CLASS = 'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50';
const TEXTAREA_CLASS = `resize-y ${INPUT_CLASS}`;

const EMPTY: CharacterFormInput = {
  name: '',
  characterClass: '',
  personality: '',
  physicalDescription: '',
  background: '',
};

export default function CharacterFormPage({ mode }: CharacterFormPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { characterId } = useParams<{ characterId: string }>();
  const { t } = useTranslation('character');
  const { classes } = useCharacterClasses();

  const [form, setForm] = useState<CharacterFormInput>(EMPTY);
  const [loading, setLoading] = useState(mode !== 'create');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [imagePromptOpen, setImagePromptOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uiImagePositionX, setUiImagePositionX] = useState(0.5);
  const [uiImagePositionY, setUiImagePositionY] = useState(0.5);
  const [isOwner, setIsOwner] = useState(false);
  const [attributes, setAttributes] = useState<CharacterAttributes | null>(null);
  const [skills, setSkills] = useState<CharacterSkills | null>(null);
  const [signatureSkill, setSignatureSkill] = useState<CharacterSignatures | null>(null);
  const allocation = useAttributeAllocation();
  const { reset: resetAllocation } = allocation;
  const skillAllocation = useSkillAllocation(form.characterClass);
  const [respecOpen, setRespecOpen] = useState(false);
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [progression, setProgression] = useState<CharacterProgression | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const readOnly = mode === 'view';
  const canEdit = mode === 'view' && (isOwner || isAdmin);
  const canDelete = mode !== 'create' && (isOwner || isAdmin);
  const isClassless = mode !== 'create' && form.characterClass === '';
  const canRespec = mode !== 'create' && isOwner;
  const unspentPoints = (progression?.unspentAttributePoints ?? 0) + (progression?.unspentSkillPoints ?? 0);
  const canSpendPoints = mode === 'view' && isOwner && unspentPoints > 0 && !isClassless;
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDelete = async () => {
    setConfirmingDelete(false);
    const res = await apiFetch(apiPath`/api/player-characters/${characterId}`, { method: 'DELETE' });
    if (res.ok) {
      notifySuccess(t('toast.deleted', { ns: 'common' }));
      navigate('/my-stuff');
    }
  };
  const registeredAdventures = useCharacterAdventures(characterId, mode === 'view');
  const adventuresTrackRef = useRef<HTMLDivElement>(null);
  const scrollAdventures = (direction: number) => adventuresTrackRef.current?.scrollBy({ left: direction * 240, behavior: 'smooth' });
  const title = mode === 'create' ? t('form.title.new') : mode === 'edit' ? t('form.title.edit') : t('form.title.fallback');

  const [importedSheet, setImportedSheet] = useState<ReturnType<typeof parseCharacterJson> | null>(null);

  const handleJsonImport = useJsonImport((raw) => {
    const data = parseCharacterJson(raw);
    setForm({
      name: data.name,
      characterClass: data.characterClass,
      personality: data.personality,
      physicalDescription: data.physicalDescription,
      background: data.background,
    });
    setImportedSheet(data);
  });

  useEffect(() => {
    if (!importedSheet) return;
    if (form.characterClass !== importedSheet.characterClass) return;
    if (allocation.attributes.length === 0) return;
    if (skillAllocation.skills.length === 0 || !skillAllocation.profile) return;

    allocation.importLevels(importedSheet.attributes);
    const signatureLevel = importedSheet.signatureSkill[skillAllocation.profile.signatureSkill.name] ?? 0;
    skillAllocation.importLevels(importedSheet.skills, signatureLevel);
    setImportedSheet(null);
  }, [importedSheet, form.characterClass, allocation, skillAllocation]);
  const errorBorder = (value: string) => submitted && !value.trim() ? ' border-red-500' : '';

  useEffect(() => {
    setSaving(false);
    setSubmitted(false);
    setError('');

    if (mode === 'create') {
      setForm(EMPTY);
      setImageUrl(null);
      setImageFile(null);
      setUiImagePositionX(0.5);
      setUiImagePositionY(0.5);
      resetAllocation();
      setLoading(false);
      return;
    }

    if (!characterId) return;

    setLoading(true);
    apiFetch(apiPath`/api/player-characters/${characterId}`)
      .then((res) => res.json())
      .then((data: PlayerCharacterDetails) => {
        setForm({
          name: data.name,
          characterClass: data.characterClass ?? '',
          personality: data.personality,
          physicalDescription: data.physicalDescription,
          background: data.background,
        });
        setImageUrl(data.imageUrl ?? null);
        setUiImagePositionX(data.uiImagePositionX ?? 0.5);
        setUiImagePositionY(data.uiImagePositionY ?? 0.5);
        setIsOwner(data.isOwner);
        setAttributes(data.attributes);
        setSkills(data.skills);
        setSignatureSkill(data.signatureSkill);
        setProgression({
          xp: data.xp,
          level: data.level,
          unspentAttributePoints: data.unspentAttributePoints,
          unspentSkillPoints: data.unspentSkillPoints,
          levelUpXpTarget: data.levelUpXpTarget,
        });
      })
      .catch(() => setError(t('form.errors.loadFailed')))
      .finally(() => setLoading(false));
  }, [mode, characterId, resetAllocation]);

  useEffect(() => {
    if (mode !== 'view' || loading) return;

    if ((location.state as { openLevelUp?: boolean } | null)?.openLevelUp) {
      setLevelUpOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [mode, loading, location.state, location.pathname, navigate]);

  const set = (field: keyof CharacterFormInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const hasBasicData =
    form.name.trim() !== '' &&
    form.characterClass !== '' &&
    form.personality.trim() !== '' &&
    form.physicalDescription.trim() !== '' &&
    form.background.trim() !== '';

  const canSave = hasBasicData && (mode !== 'create' || (allocation.isComplete && skillAllocation.isComplete));

  const buildPrompt = () => buildImagePrompt({
    subject: 'character',
    fields: [
      { label: 'Name', value: form.name },
      { label: 'Class', value: form.characterClass },
      { label: 'Personality', value: form.personality },
      { label: 'Appearance', value: form.physicalDescription },
      { label: 'Background', value: form.background },
    ],
  });

  const handleImageUpload = async (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    const position = await resolveImagePosition(file);
    setUiImagePositionX(position.x);
    setUiImagePositionY(position.y);
  };

  const handleImageRemove = async () => {
    if (characterId) {
      await api.character.removeImage(characterId);
    }
    setImageUrl(null);
    setImageFile(null);
  };

  const handleImageGenerate = async () => {
    const blob = await api.imageGenerations.generate(buildPrompt());
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

    if (!canSave) return;

    if (mode === 'create' && !imageFile && !imageUrl) {
      setImagePromptOpen(true);
      return;
    }

    await submitCharacter(false);
  };

  const submitCharacter = async (shouldGenerateImage: boolean) => {
    setSaving(true);

    const body = {
      name: form.name,
      personality: form.personality,
      physicalDescription: form.physicalDescription,
      background: form.background,
      uiImagePositionX,
      uiImagePositionY,
    };

    const createBody = {
      ...body,
      characterClass: form.characterClass,
      attributes: allocation.levels,
      skills: skillAllocation.levels,
      signatureSkill: skillAllocation.signatureSkill,
    };

    try {
      if (mode === 'create') {
        const res = await apiFetch('/api/player-characters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createBody),
          silent: true,
        });
        if (!res.ok) throw new Error(await extractApiError(res) ?? t('form.errors.saveFailed'));
        const data = await res.json();
        const id = data.id;

        const file = imageFile ?? (shouldGenerateImage
          ? await (async () => {
              const blob = await api.imageGenerations.generate(buildPrompt(), { silent: true });
              return new File([blob], 'generated.png', { type: 'image/png' });
            })()
          : null);

        if (file) {
          const uploadRes = await api.character.uploadImage(id, file, { silent: true });
          if (!uploadRes.ok) throw new Error(await extractApiError(uploadRes) ?? t('form.errors.saveFailed'));

          if (!imageFile) {
            const position = await resolveImagePosition(file);
            await apiFetch(apiPath`/api/player-characters/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...body, uiImagePositionX: position.x, uiImagePositionY: position.y }),
              silent: true,
            }).catch(() => {});
          }
        }

        notifySuccess(t('toast.saved', { ns: 'common' }));
        navigate(`/character/${id}/view`);
      } else {
        const res = await apiFetch(apiPath`/api/player-characters/${characterId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          silent: true,
        });
        if (!res.ok) throw new Error(await extractApiError(res) ?? t('form.errors.saveFailed'));

        if (imageFile) {
          const uploadRes = await api.character.uploadImage(characterId!, imageFile, { silent: true });
          if (!uploadRes.ok) throw new Error(await extractApiError(uploadRes) ?? t('form.errors.saveFailed'));
        }

        notifySuccess(t('toast.saved', { ns: 'common' }));
        navigate(`/character/${characterId}/view`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('form.errors.saveFailed');
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
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              {mode === 'view' && progression && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {t('form.levelUp.levelChip', { level: progression.level, xp: progression.xp })}
                </span>
              )}
              {mode === 'view' && unspentPoints > 0 && (
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  {t('form.levelUp.unspentChip', { count: unspentPoints })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {canSpendPoints && (
                <button type="button" onClick={() => setLevelUpOpen(true)} className="flex items-center gap-1.5 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500/90">
                  <ChevronUp className="h-3.5 w-3.5" />
                  {t('form.levelUp.button')}
                </button>
              )}
              {mode === 'create' && (
                <label className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted">
                  {t('form.actions.importJson')}
                  <input type="file" accept=".json" className="sr-only" onChange={handleJsonImport} />
                </label>
              )}
              {canRespec && (
                <button type="button" onClick={() => setRespecOpen(true)} className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t('form.respec.button')}
                </button>
              )}
              {canEdit && (
                <button type="button" onClick={() => navigate(`/character/${characterId}/edit`)} className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
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
            canGenerate={mode !== 'view' && hasBasicData}
            uiImagePositionX={uiImagePositionX}
            uiImagePositionY={uiImagePositionY}
            onUiImagePositionChange={(x, y) => { setUiImagePositionX(x); setUiImagePositionY(y); }}
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            onGenerate={handleImageGenerate}
          />

          <div className="flex flex-col gap-5 rounded-md border border-border p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('form.sections.basicData')}</span>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('form.fields.name')}</label>
              <input type="text" value={form.name} onChange={set('name')} disabled={readOnly} className={`${INPUT_CLASS}${errorBorder(form.name)}`} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('form.fields.personality')}</label>
              <textarea rows={4} value={form.personality} onChange={set('personality')} disabled={readOnly} className={`${TEXTAREA_CLASS}${errorBorder(form.personality)}`} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('form.fields.background')}</label>
              <textarea rows={4} value={form.background} onChange={set('background')} disabled={readOnly} className={`${TEXTAREA_CLASS}${errorBorder(form.background)}`} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('form.fields.physicalDescription')}</label>
              <textarea rows={4} value={form.physicalDescription} onChange={set('physicalDescription')} disabled={readOnly} className={`${TEXTAREA_CLASS}${errorBorder(form.physicalDescription)}`} />
            </div>
          </div>

          {mode === 'view' && progression && (
            <div className="flex flex-col gap-2 rounded-md border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('form.levelUp.progressTitle')}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {t('form.levelUp.levelChip', { level: progression.level, xp: progression.xp })}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.round((progression.xp / progression.levelUpXpTarget) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {t('form.levelUp.progressDetail', {
                  xp: progression.xp,
                  target: progression.levelUpXpTarget,
                  remaining: progression.levelUpXpTarget - progression.xp,
                  percent: Math.round((progression.xp / progression.levelUpXpTarget) * 100),
                })}
              </span>
            </div>
          )}

          {mode === 'create' && <AttributeSection mode="create" allocation={allocation} />}
          {mode === 'view' && attributes && <AttributeSection mode="view" values={attributes} />}

          {mode === 'create' && (
            <SkillSection
              mode="create"
              characterClass={form.characterClass}
              allocation={skillAllocation}
              classSelector={
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">{t('form.fields.class')}</label>
                  <select value={form.characterClass} onChange={set('characterClass')} className={`${INPUT_CLASS}${submitted && form.characterClass === '' ? ' border-red-500' : ''}`}>
                    <option value="" disabled>{t('form.classPlaceholder')}</option>
                    {classes.map((option) => (
                      <option key={option.name} value={option.name}>
                        {t(`classes.${option.name}`, { defaultValue: option.label })}
                      </option>
                    ))}
                  </select>
                </div>
              }
            />
          )}
          {mode === 'view' && skills && signatureSkill && (
            <SkillSection
              mode="view"
              characterClass={form.characterClass || null}
              skills={skills}
              signatureSkill={signatureSkill}
              classSelector={
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">{t('form.fields.class')}</label>
                  <select value={form.characterClass} disabled className={INPUT_CLASS}>
                    <option value="" disabled>{t('form.classPlaceholder')}</option>
                    {classes.map((option) => (
                      <option key={option.name} value={option.name}>
                        {t(`classes.${option.name}`, { defaultValue: option.label })}
                      </option>
                    ))}
                  </select>
                </div>
              }
            />
          )}

          {mode === 'view' && registeredAdventures.length > 0 && (
            <div className="flex flex-col gap-3 rounded-md border border-border p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('form.sections.registeredIn')}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollAdventures(-1)}
                  className="flex-shrink-0 rounded-full border border-border p-1 text-foreground hover:bg-muted"
                  aria-label={t('form.actions.scrollLeft')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div ref={adventuresTrackRef} className="flex flex-1 gap-3 overflow-x-auto scroll-smooth py-1">
                  {registeredAdventures.map((adventure) => (
                    <a
                      key={adventure.publicId}
                      href={`/adventure/${adventure.publicId}/view`}
                      className="flex w-40 flex-shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
                    >
                      <div className="relative h-28 flex-shrink-0 bg-muted">
                        {adventure.imageUrl && (
                          <img
                            src={adventure.imageUrl}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                            style={{ objectPosition: objectPositionOf(adventure.uiImagePositionX, adventure.uiImagePositionY) }}
                          />
                        )}
                      </div>
                      <p className="truncate p-3 text-sm font-semibold text-foreground">{adventure.name}</p>
                    </a>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => scrollAdventures(1)}
                  className="flex-shrink-0 rounded-full border border-border p-1 text-foreground hover:bg-muted"
                  aria-label={t('form.actions.scrollRight')}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!readOnly && (
        <div className="border-t border-border bg-background px-6 py-4">
          <div className="mx-auto flex w-full max-w-5xl gap-3">
            <button type="submit" disabled={saving || !canSave} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? t('form.actions.saving') : t('form.actions.save')}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
              {t('form.actions.cancel')}
            </button>
            {mode === 'edit' && isClassless && (
              <span className="self-center rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                {t('form.skills.needsClass')}
              </span>
            )}
          </div>
        </div>
      )}

      {respecOpen && characterId && (
        <RespecModal
          characterId={characterId}
          characterName={form.name}
          currentClass={form.characterClass}
          attributes={attributes}
          skills={skills}
          signatureSkill={signatureSkill}
          onSaved={(details) => {
            setForm((prev) => ({ ...prev, characterClass: details.characterClass ?? '' }));
            setAttributes(details.attributes);
            setSkills(details.skills);
            setSignatureSkill(details.signatureSkill);
            setProgression({
              xp: details.xp,
              level: details.level,
              unspentAttributePoints: details.unspentAttributePoints,
              unspentSkillPoints: details.unspentSkillPoints,
              levelUpXpTarget: details.levelUpXpTarget,
            });
            setRespecOpen(false);
            navigate(`/character/${characterId}/view`);
          }}
          onClose={() => setRespecOpen(false)}
        />
      )}

      {levelUpOpen && characterId && progression && attributes && skills && signatureSkill && (
        <LevelUpModal
          characterId={characterId}
          characterName={form.name}
          characterClass={form.characterClass}
          level={progression.level}
          attributes={attributes}
          skills={skills}
          signatureSkill={signatureSkill}
          unspentAttributePoints={progression.unspentAttributePoints}
          unspentSkillPoints={progression.unspentSkillPoints}
          onSaved={(details) => {
            setAttributes(details.attributes);
            setSkills(details.skills);
            setSignatureSkill(details.signatureSkill);
            setProgression({
              xp: details.xp,
              level: details.level,
              unspentAttributePoints: details.unspentAttributePoints,
              unspentSkillPoints: details.unspentSkillPoints,
              levelUpXpTarget: details.levelUpXpTarget,
            });
            setLevelUpOpen(false);
          }}
          onClose={() => setLevelUpOpen(false)}
        />
      )}

      {confirmingDelete && (
        <ConfirmDialog
          message={t('confirm.deleteCharacter', { ns: 'common' })}
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
          onConfirm={() => { setImagePromptOpen(false); submitCharacter(true); }}
          onCancel={() => { setImagePromptOpen(false); submitCharacter(false); }}
          onClose={() => setImagePromptOpen(false)}
        />
      )}
    </form>
  );
}
