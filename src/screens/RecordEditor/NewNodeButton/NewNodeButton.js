import PropTypes from "prop-types";

import { Button } from "components/Button";

import styles from "./styles";

export const NewNodeButton = (props) => {
  const { nodeDefLabel, onPress } = props;
  return (
    <Button
      icon="plus"
      onPress={onPress}
      style={styles.newButton}
      textKey="common:newItemWithParam"
      textParams={{ item: nodeDefLabel }}
    />
  );
};

NewNodeButton.propTypes = {
  nodeDefLabel: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};
