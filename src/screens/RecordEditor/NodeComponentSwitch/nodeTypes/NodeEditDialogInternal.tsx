import * as React from "react";
import { StyleSheet } from "react-native";

import { useTranslation } from "localization";

import { Button, Modal } from "components";

import { NodeDefFormItemHeader } from "screens/RecordEditor/NodeDefFormItem/NodeDefFormItemHeader";

const styles = StyleSheet.create({
  doneButton: { alignSelf: "center" },
});

type Props = {
  children?: React.ReactNode;
  doneButtonLabel?: string;
  nodeDef: any;
  onDismiss: () => void;
  onDone?: () => void;
  parentNodeUuid?: string;
};

export const NodeEditDialogInternal = (props: Props) => {
  const {
    children,
    doneButtonLabel = "common:close",
    nodeDef,
    onDismiss,
    onDone,
    parentNodeUuid,
  } = props;

  const { t } = useTranslation();

  return (
    <Modal showCloseButton={false} onDismiss={onDone ?? onDismiss}>
      <NodeDefFormItemHeader
        nodeDef={nodeDef}
        parentNodeUuid={parentNodeUuid}
      />
      {children}
      <Button onPress={onDone ?? onDismiss} style={styles.doneButton}>
        {t(doneButtonLabel)}
      </Button>
    </Modal>
  );
};
