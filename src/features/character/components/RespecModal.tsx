import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Star } from 'lucide-react';
import { apiFetch, apiPath, extractApiError, notifyError, notifySuccess } from '../../../utils/api';
import { useCharacterClasses } from '../hooks/useCharacterClasses';
import { useAttributeAllocation } from '../hooks/useAttributeAllocation';
import { useAttributeVocabulary } from '../hooks/useAttributeVocabulary';
import { useSkillAllocation } from '../hooks/useSkillAllocation';
import { useSkillVocabulary } from '../hooks/useSkillVocabulary';
import type { CharacterAttributes, CharacterSignatures, CharacterSkills, PlayerCharacterDetails } from '../types';

const ATTRIBUTE_HIGH_LEVEL_COST = 2;

type RespecModalProps = {
  characterId: string;
  characterName: string;
  currentClass: string;
  attributes: CharacterAttributes | null;
  skills: CharacterSkills | null;
  signatureSkill: CharacterSignatures | null;
  onSaved: (details: PlayerCharacterDetails) => void;
  onClose: () => void;
};

type RowProps = {
  label: string;
  signatureBadge?: string;
  level: number;
  canIncrement: boolean;
  canDecrement: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  increaseLabel: string;
  decreaseLabel: string;
};

function Row(props: RowProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        {props.label}
        {props.signatureBadge && (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <Star className="h-3 w-3" />
            {props.signatureBadge}
          </span>
        )}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={props.onDecrement}
          aria-label={props.decreaseLabel}
          className={`rounded-full border border-border p-1 text-foreground hover:bg-muted${props.canDecrement ? '' : ' invisible'}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-5 text-center text-sm font-semibold text-foreground">{props.level}</span>
        <button
          type="button"
          onClick={props.onIncrement}
          aria-label={props.increaseLabel}
          className={`rounded-full border border-border p-1 text-foreground hover:bg-muted${props.canIncrement ? '' : ' invisible'}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function RespecModal({
  characterId,
  characterName,
  currentClass,
  attributes,
  skills,
  signatureSkill,
  onSaved,
  onClose,
}: RespecModalProps) {
  const { t } = useTranslation('character');
  const { classes } = useCharacterClasses();
  const { vocabulary } = useSkillVocabulary();
  const { vocabulary: attributeVocabulary } = useAttributeVocabulary();
  const [selectedClass, setSelectedClass] = useState(currentClass);

  const currentProfile = classes.find((option) => option.name === currentClass) ?? null;
  const attributeHighCostFrom = (attributeVocabulary?.creation.levelCap ?? 0) + 1;

  const attributeBudget = attributes && attributeVocabulary
    ? Object.values(attributes).reduce(
        (sum, level) => sum + Math.min(level, attributeHighCostFrom - 1)
          + Math.max(0, level - (attributeHighCostFrom - 1)) * ATTRIBUTE_HIGH_LEVEL_COST,
        0)
    : undefined;

  const skillBudget = skills && signatureSkill && currentProfile && vocabulary
    ? Object.entries(skills).reduce(
        (sum, [name, level]) => sum + level * (currentProfile.favoredSkills.includes(name)
          ? vocabulary.creation.favoredCost
          : vocabulary.creation.offClassCost),
        0)
      + ((Object.values(signatureSkill)[0] ?? vocabulary.creation.signatureStartingLevel)
        - vocabulary.creation.signatureStartingLevel) * vocabulary.creation.favoredCost
    : undefined;

  const allocation = useAttributeAllocation(
    attributeBudget !== undefined && attributeVocabulary
      ? { points: attributeBudget, levelCap: attributeVocabulary.maxLevel }
      : undefined,
  );
  const skillAllocation = useSkillAllocation(
    selectedClass,
    skillBudget !== undefined && vocabulary
      ? { points: skillBudget, levelCap: vocabulary.maxLevel }
      : undefined,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const profile = skillAllocation.profile;
  const favored = profile?.favoredSkills ?? [];
  const favoredOptions = favored
    .map((name) => skillAllocation.skills.find((skill) => skill.name === name))
    .filter((skill) => skill !== undefined);
  const otherOptions = skillAllocation.skills.filter((skill) => !favored.includes(skill.name));

  const canSave = selectedClass !== '' && allocation.isComplete && skillAllocation.isComplete;
  const increaseLabel = t('form.skills.increase');
  const decreaseLabel = t('form.skills.decrease');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const res = await apiFetch(apiPath`/api/player-characters/${characterId}/sheet`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        characterClass: selectedClass,
        attributes: allocation.levels,
        skills: skillAllocation.levels,
        signatureSkill: skillAllocation.signatureSkill,
      }),
      silent: true,
    });

    if (!res.ok) {
      const message = (await extractApiError(res)) ?? t('form.errors.saveFailed');
      setError(message);
      notifyError(message);
      setSaving(false);
      return;
    }

    notifySuccess(t('toast.saved', { ns: 'common' }));
    onSaved(await res.json());
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-5xl flex-col gap-4 rounded-lg border border-border bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-foreground">{t('form.respec.title', { name: characterName })}</h2>

        {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">{t('form.fields.class')}</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="" disabled>{t('form.classPlaceholder')}</option>
            {classes.map((option) => (
              <option key={option.name} value={option.name}>
                {t(`classes.${option.name}`, { defaultValue: option.label })}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-1 text-sm text-muted-foreground">
          <span className={allocation.remaining < 0 ? 'font-medium text-destructive' : ''}>
            {t('form.respec.attributePointsLeft', { count: allocation.remaining })}
          </span>
          <span className={skillAllocation.remaining < 0 ? 'font-medium text-destructive' : ''}>
            {t('form.respec.skillPointsLeft', { count: skillAllocation.remaining })}
          </span>
          {(allocation.remaining < 0 || skillAllocation.remaining < 0) && (
            <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              {t('form.overspent')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('form.attributes.title')}
              </span>
              <button
                type="button"
                onClick={allocation.reset}
                className="text-[11px] font-medium uppercase tracking-wide text-foreground underline-offset-2 hover:underline"
              >
                {t('form.attributes.reset')}
              </button>
            </div>
            {allocation.attributes.length === 0 && (
              <span className="text-sm text-muted-foreground">{t('form.loading')}</span>
            )}
            {allocation.attributes.map((attribute) => (
              <Row
                key={attribute.name}
                label={t(`form.attributes.names.${attribute.name}`, { defaultValue: attribute.label })}
                level={allocation.levelOf(attribute.name)}
                canIncrement={allocation.canIncrement(attribute.name)}
                canDecrement={allocation.canDecrement(attribute.name)}
                onIncrement={() => allocation.increment(attribute.name)}
                onDecrement={() => allocation.decrement(attribute.name)}
                increaseLabel={increaseLabel}
                decreaseLabel={decreaseLabel}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('form.skills.classSkills')}
                </span>
                {profile && (
                  <button
                    type="button"
                    onClick={skillAllocation.resetClassSkills}
                    className="text-[11px] font-medium uppercase tracking-wide text-foreground underline-offset-2 hover:underline"
                  >
                    {t('form.skills.reset')}
                  </button>
                )}
              </div>
              {profile && vocabulary && (
                <span className="text-xs text-muted-foreground">
                  {t('form.skills.costPerLevel', { count: vocabulary.creation.favoredCost })}
                </span>
              )}
            </div>
            {!profile && <span className="text-sm text-muted-foreground">{t('form.classPlaceholder')}</span>}
            {profile && (
              <>
                <Row
                  label={t(`form.skills.signatures.${profile.signatureSkill.name}`, {
                    defaultValue: profile.signatureSkill.label,
                  })}
                  signatureBadge={t('form.skills.signatureBadge')}
                  level={skillAllocation.signatureLevel}
                  canIncrement={skillAllocation.canIncrementSignature}
                  canDecrement={skillAllocation.canDecrementSignature}
                  onIncrement={skillAllocation.incrementSignature}
                  onDecrement={skillAllocation.decrementSignature}
                  increaseLabel={increaseLabel}
                  decreaseLabel={decreaseLabel}
                />
                {favoredOptions.map((skill) => (
                  <Row
                    key={skill.name}
                    label={t(`form.skills.names.${skill.name}`, { defaultValue: skill.label })}
                    level={skillAllocation.levelOf(skill.name)}
                    canIncrement={skillAllocation.canIncrement(skill.name)}
                    canDecrement={skillAllocation.canDecrement(skill.name)}
                    onIncrement={() => skillAllocation.increment(skill.name)}
                    onDecrement={() => skillAllocation.decrement(skill.name)}
                    increaseLabel={increaseLabel}
                    decreaseLabel={decreaseLabel}
                  />
                ))}
              </>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('form.skills.otherSkills')}
                </span>
                {profile && (
                  <button
                    type="button"
                    onClick={skillAllocation.resetOtherSkills}
                    className="text-[11px] font-medium uppercase tracking-wide text-foreground underline-offset-2 hover:underline"
                  >
                    {t('form.skills.reset')}
                  </button>
                )}
              </div>
              {profile && vocabulary && (
                <span className="text-xs text-muted-foreground">
                  {t('form.skills.costPerLevel', { count: vocabulary.creation.offClassCost })}
                </span>
              )}
            </div>
            {!profile && <span className="text-sm text-muted-foreground">{t('form.classPlaceholder')}</span>}
            {profile &&
              otherOptions.map((skill) => (
                <Row
                  key={skill.name}
                  label={t(`form.skills.names.${skill.name}`, { defaultValue: skill.label })}
                  level={skillAllocation.levelOf(skill.name)}
                  canIncrement={skillAllocation.canIncrement(skill.name)}
                  canDecrement={skillAllocation.canDecrement(skill.name)}
                  onIncrement={() => skillAllocation.increment(skill.name)}
                  onDecrement={() => skillAllocation.decrement(skill.name)}
                  increaseLabel={increaseLabel}
                  decreaseLabel={decreaseLabel}
                />
              ))}
          </div>
        </div>

        </div>

        <div className="flex items-center justify-end border-t border-border pt-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              {t('form.actions.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !canSave}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? t('form.actions.saving') : t('form.actions.save')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
