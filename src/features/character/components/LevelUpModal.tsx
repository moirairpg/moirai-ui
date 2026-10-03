import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Star } from 'lucide-react';
import { apiFetch, apiPath, extractApiError, notifyError, notifySuccess } from '../../../utils/api';
import { useLevelUpAllocation } from '../hooks/useLevelUpAllocation';
import type { CharacterAttributes, CharacterSignatures, CharacterSkills, PlayerCharacterDetails } from '../types';

type LevelUpModalProps = {
  characterId: string;
  characterName: string;
  characterClass: string;
  level: number;
  attributes: CharacterAttributes;
  skills: CharacterSkills;
  signatureSkill: CharacterSignatures;
  unspentAttributePoints: number;
  unspentSkillPoints: number;
  onSaved: (details: PlayerCharacterDetails) => void;
  onClose: () => void;
};

type SpendRowProps = {
  label: string;
  signatureBadge?: string;
  committedLevel: number;
  pendingLevel: number;
  canIncrement: boolean;
  canDecrement: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  increaseLabel: string;
  decreaseLabel: string;
};

function SpendRow(props: SpendRowProps) {
  const hasPending = props.pendingLevel > props.committedLevel;

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
        {hasPending ? (
          <span className="text-center text-sm font-semibold text-primary">
            {props.committedLevel} → {props.pendingLevel}
          </span>
        ) : (
          <span className="w-5 text-center text-sm font-semibold text-foreground">{props.committedLevel}</span>
        )}
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

export default function LevelUpModal({
  characterId,
  characterName,
  characterClass,
  level,
  attributes,
  skills,
  signatureSkill,
  unspentAttributePoints,
  unspentSkillPoints,
  onSaved,
  onClose,
}: LevelUpModalProps) {
  const { t } = useTranslation('character');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const allocation = useLevelUpAllocation({
    characterClass,
    attributes,
    skills,
    signatureLevel: Object.values(signatureSkill)[0] ?? 0,
    attributePointsAvailable: unspentAttributePoints,
    skillPointsAvailable: unspentSkillPoints,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const profile = allocation.profile;
  const favored = profile?.favoredSkills ?? [];
  const favoredOptions = favored
    .map((name) => allocation.skills.find((skill) => skill.name === name))
    .filter((skill) => skill !== undefined);
  const otherOptions = allocation.skills.filter((skill) => !favored.includes(skill.name));

  const increaseLabel = t('form.skills.increase');
  const decreaseLabel = t('form.skills.decrease');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const res = await apiFetch(apiPath`/api/player-characters/${characterId}/sheet`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        characterClass,
        attributes: allocation.levels,
        skills: allocation.skillLevels,
        signatureSkill: allocation.signatureSkill,
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
        <h2 className="text-lg font-semibold text-foreground">
          {t('form.levelUp.title', { name: characterName, level })}
        </h2>

        {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">

        <div className="flex flex-wrap items-center gap-x-8 gap-y-1 text-sm text-muted-foreground">
          <span>{t('form.levelUp.attributePointsLeft', { count: allocation.attributeRemaining })}</span>
          <span>{t('form.levelUp.skillPointsLeft', { count: allocation.skillRemaining })}</span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('form.attributes.title')}
              </span>
              <span className="text-xs text-muted-foreground">{t('form.levelUp.attributeCosts')}</span>
            </div>
            {allocation.attributes.map((attribute) => (
              <SpendRow
                key={attribute.name}
                label={t(`form.attributes.names.${attribute.name}`, { defaultValue: attribute.label })}
                committedLevel={allocation.committedAttributeOf(attribute.name)}
                pendingLevel={allocation.attributeLevelOf(attribute.name)}
                canIncrement={allocation.canIncrementAttribute(attribute.name)}
                canDecrement={allocation.canDecrementAttribute(attribute.name)}
                onIncrement={() => allocation.incrementAttribute(attribute.name)}
                onDecrement={() => allocation.decrementAttribute(attribute.name)}
                increaseLabel={increaseLabel}
                decreaseLabel={decreaseLabel}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('form.skills.classSkills')}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('form.skills.costPerLevel', { count: allocation.favoredCost })}
              </span>
            </div>
            {profile && (
              <>
                <SpendRow
                  label={t(`form.skills.signatures.${profile.signatureSkill.name}`, {
                    defaultValue: profile.signatureSkill.label,
                  })}
                  signatureBadge={t('form.skills.signatureBadge')}
                  committedLevel={allocation.signatureLevel - allocation.pendingSignature}
                  pendingLevel={allocation.signatureLevel}
                  canIncrement={allocation.canIncrementSignature}
                  canDecrement={allocation.canDecrementSignature}
                  onIncrement={allocation.incrementSignature}
                  onDecrement={allocation.decrementSignature}
                  increaseLabel={increaseLabel}
                  decreaseLabel={decreaseLabel}
                />
                {favoredOptions.map((skill) => (
                  <SpendRow
                    key={skill.name}
                    label={t(`form.skills.names.${skill.name}`, { defaultValue: skill.label })}
                    committedLevel={allocation.committedSkillOf(skill.name)}
                    pendingLevel={allocation.skillLevelOf(skill.name)}
                    canIncrement={allocation.canIncrementSkill(skill.name)}
                    canDecrement={allocation.canDecrementSkill(skill.name)}
                    onIncrement={() => allocation.incrementSkill(skill.name)}
                    onDecrement={() => allocation.decrementSkill(skill.name)}
                    increaseLabel={increaseLabel}
                    decreaseLabel={decreaseLabel}
                  />
                ))}
              </>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('form.skills.otherSkills')}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('form.skills.costPerLevel', { count: allocation.offClassCost })}
              </span>
            </div>
            {profile &&
              otherOptions.map((skill) => (
                <SpendRow
                  key={skill.name}
                  label={t(`form.skills.names.${skill.name}`, { defaultValue: skill.label })}
                  committedLevel={allocation.committedSkillOf(skill.name)}
                  pendingLevel={allocation.skillLevelOf(skill.name)}
                  canIncrement={allocation.canIncrementSkill(skill.name)}
                  canDecrement={allocation.canDecrementSkill(skill.name)}
                  onIncrement={() => allocation.incrementSkill(skill.name)}
                  onDecrement={() => allocation.decrementSkill(skill.name)}
                  increaseLabel={increaseLabel}
                  decreaseLabel={decreaseLabel}
                />
              ))}
          </div>
        </div>

        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <button
            type="button"
            onClick={allocation.reset}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            {t('form.levelUp.reset')}
          </button>
          <div className="flex items-center gap-3">
            {!allocation.isSaveable && (
              <span className="text-xs text-muted-foreground">
                {allocation.hasLegalPlacement
                  ? t('form.levelUp.pointsLeftHint', {
                      count: allocation.attributeRemaining + allocation.skillRemaining,
                    })
                  : t('form.levelUp.nothingToPlaceHint')}
              </span>
            )}
            {allocation.isSaveable && !allocation.hasLegalPlacement
              && (allocation.attributeRemaining > 0 || allocation.skillRemaining > 0) && (
              <span className="text-xs text-muted-foreground">
                {t('form.levelUp.bankedHint', {
                  count: allocation.attributeRemaining + allocation.skillRemaining,
                })}
              </span>
            )}
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
              disabled={saving || !allocation.isSaveable}
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
