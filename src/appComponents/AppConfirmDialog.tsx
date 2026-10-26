import React from "react";
import SwipeButton from "rn-swipe-button";

import { useConfirmDialog } from "state/confirm/useConfirmDialog";

import {
  Button,
  Checkbox,
  Dialog,
  Markdown,
  RadioButton,
  RadioButtonGroup,
  Text,
  TextInput,
  View as OFView,
  VView,
} from "components";
import { useTranslation } from "localization";
import { useAppTheme } from "theme";

export const AppConfirmDialog = () => {
  const { t } = useTranslation();

  const {
    isOpen,
    cancel,
    cancelButtonStyle,
    cancelButtonTextKey,
    confirm,
    confirmButtonEnabled,
    confirmButtonStyle,
    confirmButtonTextKey,
    confirmInProgress,
    messageIsMarkdown,
    messageKey,
    messageParams,
    multipleChoiceOptions,
    onMultipleChoiceOptionChange,
    onSingleChoiceOptionChange,
    onTextInputChange,
    selectedMultipleChoiceValues,
    selectedSingleChoiceValue,
    setSwipeConfirmed,
    textInputToConfirm,
    textInputToConfirmLabelKey,
    singleChoiceOptions,
    swipeToConfirm,
    swipeToConfirmTitleKey,
    textInputValue,
    titleKey,
  } = useConfirmDialog();

  const theme = useAppTheme();

  return (
    <Dialog
      actionsContent={
        <>
          <Button
            color="secondary"
            disabled={confirmInProgress}
            labelVariant="bodyLarge"
            onPress={cancel}
            style={cancelButtonStyle}
            testID="confirm-dialog-cancel-button"
            textKey={cancelButtonTextKey}
          />
          <Button
            disabled={!confirmButtonEnabled || confirmInProgress}
            loading={confirmInProgress}
            onPress={confirm}
            labelVariant="bodyLarge"
            style={confirmButtonStyle}
            testID="confirm-dialog-confirm-button"
            textKey={confirmButtonTextKey}
          />
        </>
      }
      onClose={cancel}
      showCloseButton={false}
      title={titleKey}
      titleTestID="confirm-dialog-title"
      visible={isOpen}
    >
      {messageKey &&
        (messageIsMarkdown ? (
          <Markdown content={t(messageKey, messageParams)} />
        ) : (
          <Text textKey={messageKey} textParams={messageParams} />
        ))}
      {(multipleChoiceOptions?.length ?? 0) > 0 && (
        <VView>
          {multipleChoiceOptions!.map((option: any) => (
            <Checkbox
              key={option.value}
              checked={
                selectedMultipleChoiceValues?.includes(option.value) ?? false
              }
              label={t(option.label)}
              onPress={() => onMultipleChoiceOptionChange(option.value)}
            />
          ))}
        </VView>
      )}
      {(singleChoiceOptions?.length ?? 0) > 0 && (
        <RadioButtonGroup
          onValueChange={onSingleChoiceOptionChange}
          value={selectedSingleChoiceValue}
        >
          <VView>
            {singleChoiceOptions!.map((option: any) => (
              <RadioButton
                key={option.value}
                label={t(option.label, option.labelParams)}
                value={option.value}
              />
            ))}
          </VView>
        </RadioButtonGroup>
      )}
      {swipeToConfirm && (
        <OFView testID="confirm-swipe-button">
          <SwipeButton
            disableResetOnTap
            onSwipeSuccess={setSwipeConfirmed}
            railBackgroundColor={theme.colors.tertiaryContainer}
            railStyles={{
              backgroundColor: theme.colors.tertiaryContainer,
              opacity: 0.7,
              borderColor: theme.colors.tertiaryContainer,
            }}
            thumbIconBackgroundColor={theme.colors.primary}
            title={t(swipeToConfirmTitleKey)}
            titleColor={theme.colors.primary}
            titleFontSize={16}
          />
        </OFView>
      )}
      {textInputToConfirm && (
        <TextInput
          label={textInputToConfirmLabelKey}
          onChange={onTextInputChange}
          value={textInputValue}
        />
      )}
    </Dialog>
  );
};
