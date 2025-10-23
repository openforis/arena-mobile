import { useNavigation } from "@react-navigation/native";

import { Button } from "components/Button";
import { screenKeys } from "screens/screenKeys";

import { SettingsSelectors } from "state/settings";

export const GpsLockingEnabledWarning = () => {
  const navigation = useNavigation();

  const settings = SettingsSelectors.useSettings();

  if (!settings?.locationGpsLocked) return null;

  return (
    // @ts-expect-error TS(2709): Cannot use namespace 'Button' as a type.
    <Button
      // @ts-expect-error TS(2304): Cannot find name 'icon'.
      icon="alert"
      // @ts-expect-error TS(7027): Unreachable code detected.
      mode="text"
      // @ts-expect-error TS(2304): Cannot find name 'textKey'.
      textKey="dataEntry:gpsLockingEnabledWarning"
      // @ts-expect-error TS(2304): Cannot find name 'onPress'.
      onPress={() => navigation.navigate(screenKeys.settings)}
    />
  );
};
