import * as React from "react";
import { StyleSheet } from "react-native";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useTranslation } from "localization";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Button, Modal } from "components";

// @ts-expect-error TS(2307): Cannot find module 'screens/RecordEditor/NodeDefFo... Remove this comment to see the full error message
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
