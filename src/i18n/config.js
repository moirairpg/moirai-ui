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
import enNotifications from './locales/en/notifications.json';
import enCharacter from './locales/en/character.json';
import enUsers from './locales/en/users.json';

import ptCommon from './locales/pt/common.json';
import ptSettings from './locales/pt/settings.json';
import ptSidebar from './locales/pt/sidebar.json';
import ptAuth from './locales/pt/auth.json';
import ptAdventure from './locales/pt/adventure.json';
import ptWorld from './locales/pt/world.json';
import ptCollection from './locales/pt/collection.json';
import ptNotifications from './locales/pt/notifications.json';
import ptCharacter from './locales/pt/character.json';
import ptUsers from './locales/pt/users.json';

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
        notifications: enNotifications,
        character: enCharacter,
        users: enUsers,
      },
      pt: {
        common: ptCommon,
        settings: ptSettings,
        sidebar: ptSidebar,
        auth: ptAuth,
        adventure: ptAdventure,
        world: ptWorld,
        collection: ptCollection,
        notifications: ptNotifications,
        character: ptCharacter,
        users: ptUsers,
      },
    },

    lng: getSavedLanguage(),

    fallbackLng: 'en',

    debug: import.meta.env.DEV,

    ns: ['common', 'settings', 'sidebar', 'auth', 'adventure', 'world', 'collection', 'notifications', 'character', 'users'],
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
