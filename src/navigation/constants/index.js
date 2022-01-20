import * as Home from 'screens/Home';
import * as ConnectionSettings from 'screens/ConnectionSettings';

export const KEYS = {
  [Home.key]: [Home.key],
  [ConnectionSettings.key]: [ConnectionSettings.key]
}
export const SCREENS = {
  [Home.key]: Home.screenConfig,
  [ConnectionSettings.key]: ConnectionSettings.screenConfig
};

export const ROUTES = {
  [Home.key]: Home.route,
  [ConnectionSettings.key]: ConnectionSettings.route
};


