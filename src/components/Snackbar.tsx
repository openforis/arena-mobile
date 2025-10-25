import { Snackbar as RNPSnackbar } from "react-native-paper";
import PropTypes from "prop-types";

export const Snackbar = (props: any) => {
  const { content, onDismiss, visible } = props;
  return (
    <RNPSnackbar visible={visible} onDismiss={onDismiss}>
      {content}
    </RNPSnackbar>
  );
};

Snackbar.propTypes = {
  content: PropTypes.any,
  onDismiss: PropTypes.func,
  visible: PropTypes.bool,
};
