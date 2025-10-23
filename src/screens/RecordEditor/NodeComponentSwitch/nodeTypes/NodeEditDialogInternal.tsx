import * as React from "react";
import { StyleSheet } from "react-native";
import PropTypes from "prop-types";

import { useTranslation } from "localization";

import { Button, Modal } from "components";

import { NodeDefFormItemHeader } from "screens/RecordEditor/NodeDefFormItem/NodeDefFormItemHeader";

const styles = StyleSheet.create({
  doneButton: { alignSelf: "center" },
});

export const NodeEditDialogInternal = (props) => {
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

NodeEditDialogInternal.propTypes = {
  children: PropTypes.node,
  doneButtonLabel: PropTypes.string,
  nodeDef: PropTypes.object.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onDone: PropTypes.func,
  parentNodeUuid: PropTypes.string,
};
