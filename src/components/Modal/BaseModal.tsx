import { Modal as RNModal, StyleProp, ViewStyle } from "react-native";
import { Edge } from "react-native-safe-area-context";

import { ModalSafeAreaView } from "./ModalSafeAreaView";

type BaseModalProps = {
  children: React.ReactNode;
  edges?: Edge[];
  onDismiss?: () => void;
  safeAreaStyle?: StyleProp<ViewStyle>;
  transparent?: boolean;
  visible?: boolean;
};

export const BaseModal = (props: BaseModalProps) => {
  const {
    children,
    edges,
    onDismiss,
    safeAreaStyle,
    transparent = false,
    visible = true,
  } = props;

  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <ModalSafeAreaView edges={edges} style={safeAreaStyle}>
        {children}
      </ModalSafeAreaView>
    </RNModal>
  );
};
