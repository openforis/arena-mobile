import { Portal, Modal as RNPModal } from "react-native-paper";

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
  return (
    <Portal>
      <RNPModal visible onDismiss={onDismiss}>
        <VView style={styles.container}>
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
      </RNPModal>
    </Portal>
  );
};
