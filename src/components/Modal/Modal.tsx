import { useTheme } from "react-native-paper";

import { CloseIconButton } from "../CloseIconButton";
import { HView } from "../HView";
import { Text } from "../Text";

import { BaseModal } from "./BaseModal";
import styles from "./styles";

type ModalProps = {
  children: React.ReactNode;
  onDismiss: () => void;
  showCloseButton?: boolean;
  titleKey?: string;
  titleParams?: any;
};

export const Modal = (props: ModalProps) => {
  const {
    children,
    onDismiss,
    showCloseButton = true,
    titleKey,
    titleParams,
  } = props;

  const theme = useTheme();

  return (
    <BaseModal
      onDismiss={onDismiss}
      safeAreaStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <HView style={styles.header}>
        {titleKey && (
          <Text
            style={styles.headerText}
            textKey={titleKey}
            textParams={titleParams}
            variant="titleLarge"
          />
        )}
        {showCloseButton && <CloseIconButton onPress={onDismiss} />}
      </HView>
      {children}
    </BaseModal>
  );
};
