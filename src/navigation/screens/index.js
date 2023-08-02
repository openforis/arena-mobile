import ConnectionSettings from 'screens/ConnectionSettings';
import Form from 'screens/Form';
import Home from 'screens/Home';
import Records from 'screens/Records';
import Settings from 'screens/Settings';
/* Settings */
import SettingsStyleColorScheme from 'screens/Settings/Screens/Style/ColorScheme';
import SettingsStyleFontBaseModifier from 'screens/Settings/Screens/Style/FontBaseModifier';
import SettingsSurveyTaxonomies from 'screens/Settings/Screens/Survey/Taxonomies';
import Survey from 'screens/Survey';
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
  [KEYS.SURVEY]: {component: Survey, options: {gestureEnabled: false}},
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
    component: SettingsStyleColorScheme,
    options: {gestureEnabled: false},
  },
};
