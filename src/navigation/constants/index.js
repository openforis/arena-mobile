import * as ConnectionSettings from 'screens/ConnectionSettings/constants';
import * as Form from 'screens/Form/constants';
import * as Home from 'screens/Home/constants';
import * as Records from 'screens/Records/constants';
import * as Settings from 'screens/Settings/constants';
/* Settings */
import * as SettingsImagesQualityAndSize from 'screens/Settings/Screens/ImagesQualityAndSize/constants';
import * as SettingsStyleColorScheme from 'screens/Settings/Screens/Style/ColorScheme/constants';
import * as SettingsStyleFontBaseModifier from 'screens/Settings/Screens/Style/FontBaseModifier/constants';
import * as SettingsSurveyTaxonomies from 'screens/Settings/Screens/Survey/Taxonomies/constants';
import * as SettingsApplicationLanguage from 'screens/Settings/Screens/ApplicationLanguage/constants';
import * as SettingsDiagnosis from 'screens/Settings/Screens/Diagnosis/constants';

import * as Surveys from 'screens/Surveys/constants';

export const KEYS = {
  [Home.key]: [Home.key],
  [ConnectionSettings.key]: [ConnectionSettings.key],
  [Settings.key]: [Settings.key],
  [Surveys.key]: [Surveys.key],
  [Records.key]: [Records.key],
  [Form.key]: [Form.key],
  /* Settings */
  [SettingsSurveyTaxonomies.key]: [SettingsSurveyTaxonomies.key],
  [SettingsStyleFontBaseModifier.key]: [SettingsStyleFontBaseModifier.key],
  [SettingsStyleColorScheme.key]: [SettingsStyleColorScheme.key],
  [SettingsImagesQualityAndSize.key]: [SettingsImagesQualityAndSize.key],
  [SettingsApplicationLanguage.key]: [SettingsApplicationLanguage.key],
  [SettingsDiagnosis.key]: [SettingsDiagnosis.key],
};

export const ROUTES = {
  [Home.key]: Home.route,
  [ConnectionSettings.key]: ConnectionSettings.route,
  [Settings.key]: Settings.route,
  [Surveys.key]: Surveys.route,
  [Records.key]: Records.route,
  [Form.key]: Form.route,
  /* Settings */
  [SettingsSurveyTaxonomies.key]: SettingsSurveyTaxonomies.route,
  [SettingsStyleFontBaseModifier.key]: SettingsStyleFontBaseModifier.route,
  [SettingsStyleColorScheme.key]: SettingsStyleColorScheme.route,
  [SettingsImagesQualityAndSize.key]: SettingsImagesQualityAndSize.route,
  [SettingsApplicationLanguage.key]: SettingsApplicationLanguage.route,
  [SettingsDiagnosis.key]: SettingsDiagnosis.route,
};
