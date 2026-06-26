import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Dialog as RNPDialog, Surface, useTheme } from "react-native-paper";

import { useTranslation } from "localization";
import { Button } from "../Button";

type DialogAction = {
  onPress: () => void;
  textKey: string;
};

type DialogProps = {
  children?: React.ReactNode;
  actions?: DialogAction[];
  closeButtonTextKey?: string;
  dismissable?: boolean;
  onClose?: () => void;
  showActions?: boolean;
  showCloseButton?: boolean;
  style?: any;
  title?: string;
  visible?: boolean;
};

export const Dialog = (props: DialogProps) => {
  const {
    actions = [],
    children,
    closeButtonTextKey = "common:close",
    dismissable: dismissableProp = true,
    onClose,
    showActions = true,
    showCloseButton: showCloseButtonProp = true,
    style,
    title,
    visible = true,
  } = props;

  const { t } = useTranslation();
  const theme = useTheme();
  const handleClose = onClose || (() => undefined);
  const dismissable = dismissableProp && !!onClose;
  const showCloseButton = showCloseButtonProp && !!onClose;

  const flatStyle = StyleSheet.flatten(style);
  const hasExplicitHeight =
    flatStyle != null &&
    (flatStyle.height != null || flatStyle.flex != null);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={dismissable ? handleClose : undefined}
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: theme.colors.backdrop }]}
        onPress={dismissable ? handleClose : undefined}
      >
        <View
          style={[styles.dialogContainer, style]}
          onStartShouldSetResponder={() => true}
        >
          <Surface
            style={[
              styles.surface,
              { backgroundColor: theme.colors.elevation.level3 },
              hasExplicitHeight && styles.surfaceFlex,
            ]}
            elevation={3}
          >
            {title && (
              <RNPDialog.Title style={styles.title}>{t(title)}</RNPDialog.Title>
            )}
            <RNPDialog.Content>{children}</RNPDialog.Content>
            {showActions && (
              <RNPDialog.Actions>
                {actions.map(({ onPress, textKey }: DialogAction) => (
                  <Button key={textKey} onPress={onPress} textKey={textKey} />
                ))}
                {showCloseButton && (
                  <Button onPress={handleClose} textKey={closeButtonTextKey} />
                )}
              </RNPDialog.Actions>
            )}
          </Surface>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  dialogContainer: {
    width: "100%",
    maxWidth: 480,
  },
  surface: {
    borderRadius: 28,
  },
  surfaceFlex: {
    flex: 1,
  },
  title: {
    marginTop: 24,
  },
});
