import { Modal as RNModal } from "react-native";
import { useTheme } from "react-native-paper";

import { CloseIconButton } from "../CloseIconButton";
import { HView } from "../HView";
import { Text } from "../Text";
import { VView } from "../VView";

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
    <RNModal
      visible
      transparent={false}
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <VView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
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
      </VView>
    </RNModal>
  );
};
