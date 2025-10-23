// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { Button } from "components/Button";

import styles from "./styles";

export const NewNodeButton = (props: any) => {
  const { disabled = undefined, nodeDefLabel, onPress } = props;
  return (
    // @ts-expect-error TS(2709): Cannot use namespace 'Button' as a type.
    <Button
      disabled={disabled}
      // @ts-expect-error TS(7027): Unreachable code detected.
      icon="plus"
      // @ts-expect-error TS(2588): Cannot assign to 'onPress' because it is a constan... Remove this comment to see the full error message
      onPress={onPress}
      // @ts-expect-error TS(2552): Cannot find name 'style'. Did you mean 'styles'?
      style={styles.newButton}
      // @ts-expect-error TS(2304): Cannot find name 'textKey'.
      textKey="common:newItemWithParam"
      // @ts-expect-error TS(2304): Cannot find name 'textParams'.
      textParams={{ item: nodeDefLabel }}
    />
  );
};

NewNodeButton.propTypes = {
  disabled: PropTypes.bool,
  nodeDefLabel: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};
