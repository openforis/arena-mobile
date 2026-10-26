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
  // custom actions content (replaces actions when specified)
  actionsContent?: React.ReactNode;
  dismissable?: boolean;
  onClose?: () => void;
  showActions?: boolean;
  // renders a close (x) icon button in the header, next to the title
  showCloseButton?: boolean;
  style?: any;
  title?: string;
  titleTestID?: string;
  visible?: boolean;
};

export const Dialog = (props: DialogProps) => {
  const {
    actions = [],
    actionsContent,
    children,
    dismissable: dismissableProp = true,
    onClose,
    showActions = true,
    showCloseButton: showCloseButtonProp = true,
    style,
    title,
    titleTestID,
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
      <View style={styles.overlay}>
        {/* backdrop is a sibling (not a parent) of the dialog, so it does not steal scroll gestures */}
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.backdrop },
          ]}
          onPress={dismissable ? handleClose : undefined}
        />
        <View style={[styles.dialogContainer, style]}>
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
                <HView style={styles.titleRow}>
                  <RNPDialog.Title
                    style={styles.titleFlex}
                    testID={titleTestID}
                  >
                    {title && t(title)}
                  </RNPDialog.Title>
                  <CloseIconButton
                    onPress={handleClose}
                    testID="dialog-close-button"
                  />
                </HView>
              ) : (
                <RNPDialog.Title style={styles.title} testID={titleTestID}>
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
            {showActions && actionsContent && (
              <RNPDialog.Actions style={styles.actions}>
                {actionsContent}
              </RNPDialog.Actions>
            )}
            {showActions && !actionsContent && actions.length > 0 && (
              <RNPDialog.Actions style={styles.actions}>
                {actions.map(({ onPress, textKey }, index) =>
                  // the last action is the primary one, the others (e.g. Cancel) are smaller
                  index < actions.length - 1 ? (
                    <Button
                      key={textKey}
                      color="secondary"
                      onPress={onPress}
                      textKey={textKey}
                    />
                  ) : (
                    <Button
                      key={textKey}
                      labelVariant="bodyLarge"
                      onPress={onPress}
                      textKey={textKey}
                    />
                  ),
                )}
              </RNPDialog.Actions>
            )}
          </Surface>
        </View>
      </View>
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
  // added to the space Paper already puts between action buttons
  actions: {
    gap: 12,
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
