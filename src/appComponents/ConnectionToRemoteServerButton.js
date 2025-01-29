import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";

import { Button } from "components";
import { screenKeys } from "screens";

export const ConnectionToRemoteServerButton = (props) => {
  const { style = null } = props;
  const navigation = useNavigation();

  return (
    <Button
      onPress={() => navigation.navigate(screenKeys.settingsRemoteConnection)}
      style={style}
      textKey="settings:connectionToRemoteServer"
    />
  );
};

ConnectionToRemoteServerButton.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
