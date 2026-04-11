import { useCallback, useEffect, useRef, useState } from 'react';
import type { SettingsMainTab } from '../types/types';

const readFontSize = (): string =>
  localStorage.getItem('fontSize') ?? '14';

const readScrollSpeed = (): number => {
  const v = Number(localStorage.getItem('scrollSpeed'));
  return v >= 1 && v <= 5 ? v : 3;
};

const readSpinnerPhrases = (): boolean =>
  localStorage.getItem('spinnerPhrases') !== 'false';

export function useSettingsController({ isOpen }: { isOpen: boolean }) {
  const [activeTab, setActiveTab] = useState<SettingsMainTab>('account');
  const [saveStatus] = useState<'success' | 'error' | null>(null);
  const [fontSize, setFontSize] = useState<string>(() => readFontSize());
  const [scrollSpeed, setScrollSpeed] = useState<number>(() => readScrollSpeed());
  const [spinnerPhrasesEnabled, setSpinnerPhrasesEnabled] = useState<boolean>(() => readSpinnerPhrases());

  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (isOpen) isInitialLoadRef.current = true;
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('scrollSpeed', String(scrollSpeed));
  }, [scrollSpeed]);

  useEffect(() => {
    localStorage.setItem('spinnerPhrases', String(spinnerPhrasesEnabled));
  }, [spinnerPhrasesEnabled]);

  return {
    activeTab,
    setActiveTab,
    saveStatus,
    fontSize,
    setFontSize,
    scrollSpeed,
    setScrollSpeed,
    spinnerPhrasesEnabled,
    setSpinnerPhrasesEnabled,
  };
}
