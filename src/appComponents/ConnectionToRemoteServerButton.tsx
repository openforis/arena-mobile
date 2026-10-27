import { useNavigator } from "navigation/navigator";
import { StyleProp, ViewStyle } from "react-native";

import { Button } from "components";

type Props = {
  style?: StyleProp<ViewStyle>;
};

export const ConnectionToRemoteServerButton = (props: Props) => {
  const { style = null } = props;
  const navigator = useNavigator();

  return (
    <Button
      labelVariant="bodyLarge"
      onPress={() =>
        navigator.navigateToSettingsRemoteConnection()
      }
      style={style}
      textKey="settings:connectionToServer"
    />
  );
};
