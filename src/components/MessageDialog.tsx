import * as React from "react";
import { Dialog, Portal } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { useTranslation } from "localization";

import { Button } from "./Button";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { ScrollView } from "./ScrollView";
import { Text } from "./Text";

export const MessageDialog = (props: any) => {
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
              // @ts-expect-error TS(2322): Type '{ children: Element; persistentScrollbar: tr... Remove this comment to see the full error message
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

MessageDialog.propTypes = {
  content: PropTypes.string,
  contentParams: PropTypes.object,
  details: PropTypes.string,
  detailsParams: PropTypes.object,
  doneButtonLabel: PropTypes.string,
  onDismiss: PropTypes.func,
  onDone: PropTypes.func,
  title: PropTypes.string,
};
