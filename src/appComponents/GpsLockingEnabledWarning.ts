import { useNavigation } from "@react-navigation/native";

// @ts-expect-error TS(2307): Cannot find module 'components/Button' or its corr... Remove this comment to see the full error message
import { Button } from "components/Button";
// @ts-expect-error TS(2307): Cannot find module 'screens/screenKeys' or its cor... Remove this comment to see the full error message
import { screenKeys } from "screens/screenKeys";

// @ts-expect-error TS(2307): Cannot find module 'state/settings' or its corresp... Remove this comment to see the full error message
import { SettingsSelectors } from "state/settings";

export const GpsLockingEnabledWarning = () => {
  const navigation = useNavigation();

  const settings = SettingsSelectors.useSettings();

  if (!settings?.locationGpsLocked) return null;

  return (
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
