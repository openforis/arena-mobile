import * as React from "react";

import { ArenaAnyNodeDef } from "@openforis/arena-core";

import { CloseIconButton, Modal } from "components";

import { NodeDefFormItem } from "screens/RecordEditorScreen/NodeDefFormItem";

type Props = {
  nodeDef: ArenaAnyNodeDef;
  onDismiss: () => void;
  parentNodeUuid?: string;
};

export const NodeEditDialog = (props: Props) => {
  const { nodeDef, onDismiss, parentNodeUuid } = props;

  const closeButton = React.useMemo(
    () => <CloseIconButton onPress={onDismiss} />,
    [onDismiss],
  );

  return (
    <Modal showCloseButton={false} onDismiss={onDismiss}>
      <NodeDefFormItem
        headerEndAccessory={closeButton}
        nodeDef={nodeDef}
        parentNodeUuid={parentNodeUuid}
      />
    </Modal>
  );
};
