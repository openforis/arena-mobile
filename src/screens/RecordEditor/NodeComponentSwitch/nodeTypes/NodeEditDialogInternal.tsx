import * as React from "react";
import { StyleSheet } from "react-native";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { useTranslation } from "localization";

import { Button, Modal } from "components";

import { NodeDefFormItemHeader } from "screens/RecordEditor/NodeDefFormItem/NodeDefFormItemHeader";

const styles = StyleSheet.create({
  doneButton: { alignSelf: "center" },
});

export const NodeEditDialogInternal = (props: any) => {
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
      // @ts-expect-error TS(2786): 'NodeDefFormItemHeader' cannot be used as a JSX co... Remove this comment to see the full error message
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
