import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enSettings from './locales/en/settings.json';
import enSidebar from './locales/en/sidebar.json';
import enAuth from './locales/en/auth.json';
import enAdventure from './locales/en/adventure.json';
import enWorld from './locales/en/world.json';
import enCollection from './locales/en/collection.json';

import koCommon from './locales/ko/common.json';
import koSettings from './locales/ko/settings.json';
import koSidebar from './locales/ko/sidebar.json';
import koAuth from './locales/ko/auth.json';
import koAdventure from './locales/ko/adventure.json';
import koWorld from './locales/ko/world.json';
import koCollection from './locales/ko/collection.json';

import zhCommon from './locales/zh-CN/common.json';
import zhSettings from './locales/zh-CN/settings.json';
import zhSidebar from './locales/zh-CN/sidebar.json';
import zhAuth from './locales/zh-CN/auth.json';
import zhAdventure from './locales/zh-CN/adventure.json';
import zhWorld from './locales/zh-CN/world.json';
import zhCollection from './locales/zh-CN/collection.json';

import jaCommon from './locales/ja/common.json';
import jaSettings from './locales/ja/settings.json';
import jaSidebar from './locales/ja/sidebar.json';
import jaAuth from './locales/ja/auth.json';
import jaAdventure from './locales/ja/adventure.json';
import jaWorld from './locales/ja/world.json';
import jaCollection from './locales/ja/collection.json';

import ruCommon from './locales/ru/common.json';
import ruSettings from './locales/ru/settings.json';
import ruSidebar from './locales/ru/sidebar.json';
import ruAuth from './locales/ru/auth.json';
import ruAdventure from './locales/ru/adventure.json';
import ruWorld from './locales/ru/world.json';
import ruCollection from './locales/ru/collection.json';

import deCommon from './locales/de/common.json';
import deSettings from './locales/de/settings.json';
import deSidebar from './locales/de/sidebar.json';
import deAuth from './locales/de/auth.json';
import deAdventure from './locales/de/adventure.json';
import deWorld from './locales/de/world.json';
import deCollection from './locales/de/collection.json';

import ptCommon from './locales/pt/common.json';
import ptSettings from './locales/pt/settings.json';
import ptSidebar from './locales/pt/sidebar.json';
import ptAuth from './locales/pt/auth.json';
import ptAdventure from './locales/pt/adventure.json';
import ptWorld from './locales/pt/world.json';
import ptCollection from './locales/pt/collection.json';

import { languages } from './languages.js';

const getSavedLanguage = () => {
  try {
    const saved = localStorage.getItem('userLanguage');
    if (saved && languages.some(lang => lang.value === saved)) {
      return saved;
    }
    return 'en';
  } catch {
    return 'en';
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        settings: enSettings,
        sidebar: enSidebar,
        auth: enAuth,
        adventure: enAdventure,
        world: enWorld,
        collection: enCollection,
      },
      ko: {
        common: koCommon,
        settings: koSettings,
        sidebar: koSidebar,
        auth: koAuth,
        adventure: koAdventure,
        world: koWorld,
        collection: koCollection,
      },
      'zh-CN': {
        common: zhCommon,
        settings: zhSettings,
        sidebar: zhSidebar,
        auth: zhAuth,
        adventure: zhAdventure,
        world: zhWorld,
        collection: zhCollection,
      },
      ja: {
        common: jaCommon,
        settings: jaSettings,
        sidebar: jaSidebar,
        auth: jaAuth,
        adventure: jaAdventure,
        world: jaWorld,
        collection: jaCollection,
      },
      ru: {
        common: ruCommon,
        settings: ruSettings,
        sidebar: ruSidebar,
        auth: ruAuth,
        adventure: ruAdventure,
        world: ruWorld,
        collection: ruCollection,
      },
      de: {
        common: deCommon,
        settings: deSettings,
        sidebar: deSidebar,
        auth: deAuth,
        adventure: deAdventure,
        world: deWorld,
        collection: deCollection,
      },
      pt: {
        common: ptCommon,
        settings: ptSettings,
        sidebar: ptSidebar,
        auth: ptAuth,
        adventure: ptAdventure,
        world: ptWorld,
        collection: ptCollection,
      },
    },

    lng: getSavedLanguage(),

    fallbackLng: 'en',

    debug: import.meta.env.DEV,

    ns: ['common', 'settings', 'sidebar', 'auth', 'adventure', 'world', 'collection'],
    defaultNS: 'common',

    keySeparator: '.',

    nsSeparator: ':',

    saveMissing: false,

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: true,
      bindI18n: 'languageChanged',
      bindI18nStore: false,
    },

    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'userLanguage',
      caches: ['localStorage'],
    },
  });

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('userLanguage', lng);
  } catch (error) {
    console.error('Failed to save language preference:', error);
  }
});

export default i18n;
