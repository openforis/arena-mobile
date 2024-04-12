import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import {defaultLanguage} from 'arena/config';
import en from 'i18n/en';
import es from 'i18n/es';
import fr from 'i18n/fr';
import pt from 'i18n/pt';
import de from 'i18n/de';

const resources = {
  en,
  es,
  fr,
  pt,
  de,
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources,
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  interpolation: {
    escapeValue: false,
  },
  keySeparator: '.',
});

export default i18n;
