import { useNavigation } from "@react-navigation/native";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Button } from "components";
// @ts-expect-error TS(2307): Cannot find module 'screens' or its corresponding ... Remove this comment to see the full error message
import { screenKeys } from "screens";

export const ConnectionToRemoteServerButton = (props: any) => {
  const { style = null } = props;
  const navigation = useNavigation();

  return (
    <Button
      // @ts-expect-error TS(2304): Cannot find name 'onPress'.
      onPress={() => navigation.navigate(screenKeys.settingsRemoteConnection)}
      // @ts-expect-error TS(2304): Cannot find name 'style'.
      style={style}
      // @ts-expect-error TS(2304): Cannot find name 'textKey'.
      textKey="settings:connectionToServer"
    />
  );
};

ConnectionToRemoteServerButton.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
