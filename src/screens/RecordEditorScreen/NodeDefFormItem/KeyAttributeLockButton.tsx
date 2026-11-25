import { IconButton } from "components";

import { useStyles } from "./styles";

type KeyAttributeLockButtonProps = {
  keyAttributeLocked: boolean;
  onPress: () => void;
};

export const KeyAttributeLockButton = (props: KeyAttributeLockButtonProps) => {
  const { keyAttributeLocked, onPress } = props;

  const styles = useStyles();

  return (
    <IconButton
      icon={keyAttributeLocked ? "lock-outline" : "lock-open-variant-outline"}
      onPress={onPress}
      size={20}
      style={styles.headerIconButton}
    />
  );
};
