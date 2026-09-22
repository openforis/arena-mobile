import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Dialog as RNPDialog, Surface, useTheme } from "react-native-paper";

import { useTranslation } from "localization";
import { Button } from "../Button";
import { CloseIconButton } from "../CloseIconButton";
import { HView } from "../HView";
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
  // renders a close (x) icon button in the header, next to the title
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
  // A definite height (height/flex) means the dialog should fill it, so the
  // content area needs flexGrow (flex: 1) to stretch and fill the remaining
  // space. A maxHeight only caps the dialog: it should shrink-wrap to its
  // content and merely be allowed to shrink (not grow) once that content
  // exceeds the cap - using flex: 1 (flexBasis: 0%) there would make the
  // content area collapse to zero height whenever content is shorter than
  // the cap, since flexGrow only distributes space within a definite parent.
  const hasDefiniteHeight =
    flatStyle != null && (flatStyle.height != null || flatStyle.flex != null);
  const hasMaxHeight = flatStyle?.maxHeight != null;

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
              hasDefiniteHeight && styles.surfaceFlex,
              hasMaxHeight && styles.surfaceShrink,
            ]}
            elevation={3}
          >
            {(title || showCloseButton) &&
              (showCloseButton ? (
                <HView style={styles.titleRow} transparent>
                  <RNPDialog.Title style={styles.titleFlex}>
                    {title && t(title)}
                  </RNPDialog.Title>
                  <CloseIconButton onPress={handleClose} />
                </HView>
              ) : (
                <RNPDialog.Title style={styles.title}>
                  {t(title)}
                </RNPDialog.Title>
              ))}
            <RNPDialog.Content
              style={[
                hasDefiniteHeight && styles.contentFlex,
                hasMaxHeight && styles.contentShrink,
              ]}
            >
              {children}
            </RNPDialog.Content>
            {showActions && actions.length > 0 && (
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
  surfaceShrink: {
    flexShrink: 1,
  },
  contentFlex: {
    flex: 1,
  },
  contentShrink: {
    flexShrink: 1,
  },
  title: {
    marginTop: 24,
  },
  titleRow: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  titleFlex: {
    flex: 1,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
});
