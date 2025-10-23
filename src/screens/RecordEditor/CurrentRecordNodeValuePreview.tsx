import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { TouchableOpacity } from "react-native";

import { FlexWrapView } from "components";
import { DataEntryActions, DataEntrySelectors, useConfirm } from "state";

import { NodeValuePreview } from "./NodeValuePreview";
import { NodeValuePreviewPropTypes } from "./NodeValuePreview/NodeValuePreviewPropTypes";

export const CurrentRecordNodeValuePreview = (props: any) => {
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
      // @ts-expect-error TS(2345): Argument of type '(dispatch: any, getState: any) =... Remove this comment to see the full error message
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
