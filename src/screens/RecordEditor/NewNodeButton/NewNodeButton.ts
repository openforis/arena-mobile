import PropTypes from "prop-types";

import { Button } from "components/Button";

import styles from "./styles";

export const NewNodeButton = (props) => {
  const { disabled = undefined, nodeDefLabel, onPress } = props;
  return (
    <Button
      disabled={disabled}
      icon="plus"
      onPress={onPress}
      style={styles.newButton}
      textKey="common:newItemWithParam"
      textParams={{ item: nodeDefLabel }}
    />
  );
};

NewNodeButton.propTypes = {
  disabled: PropTypes.bool,
  nodeDefLabel: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};
