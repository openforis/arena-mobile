import { View } from "react-native";
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
  // custom title content (used when titleKey is not specified)
  title?: React.ReactNode;
  titleKey?: string;
  titleParams?: any;
};

export const Modal = (props: ModalProps) => {
  const {
    children,
    onDismiss,
    showCloseButton = true,
    title,
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
      {(titleKey || title || showCloseButton) && (
        <HView style={styles.header}>
          <View style={styles.headerContent}>
            {titleKey ? (
              <Text
                textKey={titleKey}
                textParams={titleParams}
                variant="titleLarge"
              />
            ) : (
              title
            )}
          </View>
          {showCloseButton && <CloseIconButton onPress={onDismiss} />}
        </HView>
      )}
      {children}
    </BaseModal>
  );
};
