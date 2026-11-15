import * as React from "react";

import { NodeDef } from "@openforis/arena-core";

import { Modal } from "components";

import { NodeDefFormItemHeader } from "screens/RecordEditor/NodeDefFormItem/NodeDefFormItemHeader";
import { Functions } from "utils/Functions";

type Props = {
  children?: React.ReactNode;
  nodeDef: NodeDef<any>;
  onDismiss?: () => void;
  parentNodeUuid?: string;
};

export const NodeEditDialogInternal = (props: Props) => {
  const { children, nodeDef, onDismiss, parentNodeUuid } = props;

  return (
    <Modal
      onDismiss={onDismiss ?? Functions.voidFn}
      title={
        <NodeDefFormItemHeader
          nodeDef={nodeDef}
          parentNodeUuid={parentNodeUuid}
        />
      }
    >
      {children}
    </Modal>
  );
};
