import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { TouchableOpacity } from "react-native";

import { FlexWrapView } from "components";
import { DataEntryActions, DataEntrySelectors, useConfirm } from "state";

import { NodeValuePreview } from "./NodeValuePreview";
import { NodeValuePreviewPropTypes } from "./NodeValuePreview/NodeValuePreviewPropTypes";

export const CurrentRecordNodeValuePreview = (props) => {
  const { nodeDef, parentNodeUuid } = props;

  if (__DEV__) {
    console.log(
      `rendering CurrentRecordNodeValuePreview for ${nodeDef.props.name}`
    );
  }

  const dispatch = useDispatch();
  const confirm = useConfirm();
  const recordEditLocked = DataEntrySelectors.useRecordEditLocked();

  const { nodes } = DataEntrySelectors.useRecordChildNodes({
    parentEntityUuid: parentNodeUuid,
    nodeDef,
  });

  const onPress = useCallback(async () => {
    if (
      recordEditLocked &&
      (await confirm({
        confirmButtonTextKey: "dataEntry:unlock.label",
        messageKey: "dataEntry:unlock.confirmMessage",
        titleKey: "dataEntry:unlock.confirmTitle",
      }))
    ) {
      dispatch(DataEntryActions.toggleRecordEditLock);
    }
  }, [confirm, dispatch, recordEditLocked]);

  return (
    <TouchableOpacity onPress={onPress}>
      <FlexWrapView>
        {nodes.map((node) => (
          <NodeValuePreview
            key={node.uuid}
            nodeDef={nodeDef}
            value={node.value}
          />
        ))}
      </FlexWrapView>
    </TouchableOpacity>
  );
};

CurrentRecordNodeValuePreview.propTypes = NodeValuePreviewPropTypes;
