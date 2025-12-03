import { useCallback } from "react";
import { TouchableOpacity } from "react-native";

import { FlexWrapView } from "components";
import {
  DataEntryActions,
  DataEntrySelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { log } from "utils";

import { NodeValuePreview } from "./NodeValuePreview";
import { NodeValuePreviewProps } from "./NodeValuePreview/NodeValuePreviewPropTypes";

type Props = NodeValuePreviewProps & {
  parentNodeUuid?: string;
};

export const CurrentRecordNodeValuePreview = (props: Props) => {
  const { nodeDef, parentNodeUuid } = props;

  log.debug(
    `rendering CurrentRecordNodeValuePreview for ${nodeDef.props.name}`
  );

  const dispatch = useAppDispatch();
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
