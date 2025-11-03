import { useNavigation } from "@react-navigation/native";
import { StyleProp, ViewStyle } from "react-native";

import { Button } from "components";
import { screenKeys } from "screens";

type Props = {
  style?: StyleProp<ViewStyle>;
};

export const ConnectionToRemoteServerButton = (props: Props) => {
  const { style = null } = props;
  const navigation = useNavigation();

  return (
    <Button
      onPress={() =>
        navigation.navigate(screenKeys.settingsRemoteConnection as never)
      }
      style={style}
      textKey="settings:connectionToServer"
    />
  );
};
