import { useNavigation } from "@react-navigation/native";

import { Button } from "components/Button";
import { screenKeys } from "screens/screenKeys";

import { SettingsSelectors } from "state/settings";

export const GpsLockingEnabledWarning = () => {
  const navigation = useNavigation();

  const settings = SettingsSelectors.useSettings();

  if (!settings?.locationGpsLocked) return null;

  return (
    <Button
      icon="alert"
      mode="text"
      textKey="dataEntry:gpsLockingEnabledWarning"
      onPress={() => navigation.navigate(screenKeys.settings)}
    />
  );
};
