import * as React from "react";

import { useTranslation } from "localization";

import { Button } from "./Button";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { Dialog } from "./Dialog";
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

  const actions = [
    { onPress: onDone ?? onDismiss ?? (() => undefined), textKey: doneButtonLabel },
  ];

  return (
    <Dialog
      actions={actions}
      dismissable
      onClose={onDismiss}
      showCloseButton={false}
      title={title}
    >
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
    </Dialog>
  );
};
