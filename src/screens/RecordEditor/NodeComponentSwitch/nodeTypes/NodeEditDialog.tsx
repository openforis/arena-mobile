import * as React from "react";
import PropTypes from "prop-types";

import { useTranslation } from "localization";

import { Button, Modal } from "components";

import { NodeDefFormItem } from "screens/RecordEditor/NodeDefFormItem";

export const NodeEditDialog = (props) => {
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

NodeEditDialog.propTypes = {
  doneButtonLabel: PropTypes.string,
  nodeDef: PropTypes.object.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onDone: PropTypes.func,
  parentNodeUuid: PropTypes.string,
};
