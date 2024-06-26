import ConnectionSettings from 'screens/ConnectionSettings';
import Form from 'screens/Form';
import Home from 'screens/Home';
import Records from 'screens/Records';
import Settings from 'screens/Settings';
import SettingsImagesQualityAndSize from 'screens/Settings/Screens/ImagesQualityAndSize';
/* Settings */
import SettingsStyleColorScheme from 'screens/Settings/Screens/Style/ColorScheme';
import SettingsStyleFontBaseModifier from 'screens/Settings/Screens/Style/FontBaseModifier';
import SettingsSurveyTaxonomies from 'screens/Settings/Screens/Survey/Taxonomies';
import SettingsApplicationLanguage from 'screens/Settings/Screens/ApplicationLanguage';
import SettingsDiagnosis from 'screens/Settings/Screens/Diagnosis';
import Surveys from 'screens/Surveys';

import {KEYS} from '../constants';

export const SCREENS = {
  [KEYS.HOME]: {component: Home, options: {gestureEnabled: false}},
  [KEYS.CONNECTION_SETTINGS]: {
    component: ConnectionSettings,
    options: {gestureEnabled: false},
  },
  [KEYS.SETTINGS]: {
    component: Settings,
    options: {gestureEnabled: false},
  },
  [KEYS.SURVEYS]: {
    component: Surveys,
    options: {gestureEnabled: false},
  },
  [KEYS.RECORDS]: {
    component: Records,
    options: {gestureEnabled: false},
  },
  [KEYS.FORM]: {
    component: Form,
    options: {gestureEnabled: false},
  },
  /* Settings */
  [KEYS.SETTINGS_SURVEY_TAXONOMIES]: {
    component: SettingsSurveyTaxonomies,
    options: {gestureEnabled: false},
  },
  [KEYS.SETTINGS_STYLE_FONT_BASE_MODIFIER]: {
    component: SettingsStyleFontBaseModifier,
    options: {gestureEnabled: false},
  },
  [KEYS.SETTINGS_STYLE_COLOR_SCHEME]: {
    component: SettingsStyleColorScheme,
    options: {gestureEnabled: false},
  },
  [KEYS.SETTINGS_IMAGES_QUALITY_AND_SIZE]: {
    component: SettingsImagesQualityAndSize,
    options: {gestureEnabled: false},
  },
  [KEYS.SETTINGS_APPLICATION_LANGUAGE]: {
    component: SettingsApplicationLanguage,
    options: {gestureEnabled: false},
  },
  [KEYS.SETTINGS_DIAGNOSIS]: {
    component: SettingsDiagnosis,
    options: {gestureEnabled: false},
  },
};
