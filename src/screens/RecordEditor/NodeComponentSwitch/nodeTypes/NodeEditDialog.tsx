import * as React from "react";

import { useTranslation } from "localization";

import { Button, Modal } from "components";

import { NodeDefFormItem } from "screens/RecordEditor/NodeDefFormItem";

type Props = {
  doneButtonLabel?: string;
  nodeDef: any;
  onDismiss: () => void;
  onDone?: () => void;
  parentNodeUuid?: string;
};

export const NodeEditDialog = (props: Props) => {
  const {
    doneButtonLabel = "common:close",
    nodeDef,
    onDismiss,
    onDone,
    parentNodeUuid,
  } = props;

  const { t } = useTranslation();

  return (
    <Modal showCloseButton={false} onDismiss={onDone ?? onDismiss}>
      <NodeDefFormItem nodeDef={nodeDef} parentNodeUuid={parentNodeUuid} />
      <Button onPress={onDone ?? onDismiss}>{t(doneButtonLabel)}</Button>
    </Modal>
  );
};
