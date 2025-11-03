import * as React from "react";
import { Dialog, Portal } from "react-native-paper";

import { useTranslation } from "localization";

import { Button } from "./Button";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { ScrollView } from "./ScrollView";
import { Text } from "./Text";

type MessageDialogProps = {
  content: string;
  contentParams?: any;
  details?: string;
  detailsParams?: any;
  doneButtonLabel?: string;
  onDismiss?: () => void;
  onDone?: () => void;
  title?: string;
};

export const MessageDialog = (props: MessageDialogProps) => {
  const {
    content,
    contentParams,
    details,
    detailsParams,
    doneButtonLabel = "common:done",
    onDismiss,
    onDone,
    title = "common:info",
  } = props;

  const { t } = useTranslation();

  return (
    <Portal>
      <Dialog visible onDismiss={onDismiss}>
        <Dialog.Title>{t(title)}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyLarge">{t(content, contentParams)}</Text>
          {details && (
            <CollapsiblePanel headerKey="common:details">
              <ScrollView
                persistentScrollbar
                transparent
                style={{ maxHeight: 200 }}
              >
                <Text selectable variant="bodyMedium">
                  {t(details, detailsParams)}
                </Text>
              </ScrollView>
            </CollapsiblePanel>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button labelVariant="bodyLarge" onPress={onDone}>
            {t(doneButtonLabel)}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
