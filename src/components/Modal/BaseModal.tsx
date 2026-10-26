import {
  Modal as RNModal,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
      {/* gestures inside a modal need their own root view (Android) */}
      <GestureHandlerRootView style={styles.gestureRoot}>
        <ModalSafeAreaView edges={edges} style={safeAreaStyle}>
          {children}
        </ModalSafeAreaView>
      </GestureHandlerRootView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
});
