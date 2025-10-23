import { Snackbar as RNPSnackbar } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

export const Snackbar = (props: any) => {
  const { onDismiss, visible } = props;
  return (
    // @ts-expect-error TS(7027): Unreachable code detected.
    <RNPSnackbar visible={visible} onDismiss={onDismiss}>
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      {content}
    </RNPSnackbar>
  );
};

Snackbar.propTypes = {
  onDismiss: PropTypes.func,
  visible: PropTypes.bool,
};
