import * as React from "react";

import { CloseIconButton, Modal } from "components";

import { NodeDefFormItem } from "screens/RecordEditor/NodeDefFormItem";

type Props = {
  nodeDef: any;
  onDismiss: () => void;
  parentNodeUuid?: string;
};

export const NodeEditDialog = (props: Props) => {
  const { nodeDef, onDismiss, parentNodeUuid } = props;

  return (
    <Modal showCloseButton={false} onDismiss={onDismiss}>
      <NodeDefFormItem
        headerEndAccessory={<CloseIconButton onPress={onDismiss} />}
        nodeDef={nodeDef}
        parentNodeUuid={parentNodeUuid}
      />
    </Modal>
  );
};
