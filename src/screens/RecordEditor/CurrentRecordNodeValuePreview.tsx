import { useCallback } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { NodeDefs, NodeDefType } from "@openforis/arena-core";

import { FlexWrapView, HView } from "components";
import {
  DataEntryActions,
  DataEntrySelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { log } from "utils";

import { NodeCoordinateTargetMapButton } from "./NodeComponentSwitch/nodeTypes/NodeCoordinateComponent";
import { NodeValuePreview } from "./NodeValuePreview";
import { NodeValuePreviewProps } from "./NodeValuePreview/NodeValuePreviewPropTypes";

const styles = StyleSheet.create({
  coordinateContainer: { alignItems: "center", flex: 1 },
});

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

  const isCoordinate = NodeDefs.getType(nodeDef) === NodeDefType.coordinate;

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
        {nodes.map((node) =>
          isCoordinate ? (
            <HView key={node.uuid} style={styles.coordinateContainer}>
              <NodeValuePreview nodeDef={nodeDef} value={node.value} />
              <NodeCoordinateTargetMapButton
                nodeDef={nodeDef}
                nodeUuid={node.uuid}
              />
            </HView>
          ) : (
            <NodeValuePreview
              key={node.uuid}
              nodeDef={nodeDef}
              value={node.value}
            />
          ),
        )}
      </FlexWrapView>
    </TouchableOpacity>
  );
};
