import { Button } from "components/Button";

import styles from "./styles";

export const NewNodeButton = (props: {disabled?: boolean, nodeDefLabel:string, onPress: () => void}) => {
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

