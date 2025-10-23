import * as React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useTranslation } from "localization";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Button, Modal } from "components";

// @ts-expect-error TS(2307): Cannot find module 'screens/RecordEditor/NodeDefFo... Remove this comment to see the full error message
import { NodeDefFormItem } from "screens/RecordEditor/NodeDefFormItem";

export const NodeEditDialog = (props: any) => {
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
