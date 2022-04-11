import * as ConnectionSettings from 'screens/ConnectionSettings/constants';
import * as Home from 'screens/Home/constants';
import * as Records from 'screens/Records/constants';
import * as Survey from 'screens/Survey/constants';
import * as Surveys from 'screens/Surveys/constants';

export const KEYS = {
  [Home.key]: [Home.key],
  [ConnectionSettings.key]: [ConnectionSettings.key],
  [Survey.key]: [Survey.key],
  [Surveys.key]: [Surveys.key],
  [Records.key]: [Records.key],
};

export const ROUTES = {
  [Home.key]: Home.route,
  [ConnectionSettings.key]: ConnectionSettings.route,
  [Survey.key]: Survey.route,
  [Surveys.key]: Surveys.route,
  [Records.key]: Records.route,
};
