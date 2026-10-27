import { useNavigator } from "navigation/navigator";

import { Button } from "components/Button";

import { SettingsSelectors } from "state/settings";

export const GpsLockingEnabledWarning = () => {
  const navigator = useNavigator();

  const settings = SettingsSelectors.useSettings();

  if (!settings?.locationGpsLocked) return null;

  return (
    <Button
      icon="alert"
      mode="text"
      textKey="dataEntry:gpsLockingEnabledWarning"
      onPress={() => navigator.navigateToSettings()}
    />
  );
};
