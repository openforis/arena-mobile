import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Dialog as RNPDialog, Surface, useTheme } from "react-native-paper";

import { useTranslation } from "localization";
import { Button } from "../Button";
import { CloseIconButton } from "../CloseIconButton";
import { BaseModal } from "../Modal/BaseModal";

type DialogAction = {
  onPress: () => void;
  textKey: string;
};

type DialogProps = {
  children?: React.ReactNode;
  actions?: DialogAction[];
  dismissable?: boolean;
  onClose?: () => void;
  showActions?: boolean;
  // renders a close (x) icon button in the top right corner, next to the title
  showCloseButton?: boolean;
  style?: any;
  title?: string;
  visible?: boolean;
};

export const Dialog = (props: DialogProps) => {
  const {
    actions = [],
    children,
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
    flatStyle != null && (flatStyle.height != null || flatStyle.flex != null);

  return (
    <BaseModal
      visible={visible}
      transparent
      safeAreaStyle={styles.safeArea}
      onDismiss={dismissable ? handleClose : undefined}
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
            {(title || showCloseButton) && (
              <View style={styles.titleRow}>
                <View style={styles.titleTextWrapper}>
                  {title && (
                    <RNPDialog.Title style={styles.title}>
                      {t(title)}
                    </RNPDialog.Title>
                  )}
                </View>
                {showCloseButton && <CloseIconButton onPress={handleClose} />}
              </View>
            )}
            <RNPDialog.Content>{children}</RNPDialog.Content>
            {showActions && (
              <RNPDialog.Actions>
                {actions.map(({ onPress, textKey }: DialogAction) => (
                  <Button key={textKey} onPress={onPress} textKey={textKey} />
                ))}
              </RNPDialog.Actions>
            )}
          </Surface>
        </View>
      </Pressable>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  titleTextWrapper: {
    flex: 1,
  },
  title: {
    marginTop: 24,
  },
});
