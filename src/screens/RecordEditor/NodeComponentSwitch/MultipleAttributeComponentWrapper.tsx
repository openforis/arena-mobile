import { memo, useCallback } from "react";

import {
  ArenaRecordNode,
  NodeDef,
  NodeDefs,
  Nodes,
} from "@openforis/arena-core";

import { HView, IconButton, VView } from "components";
import {
  DataEntryActions,
  DataEntrySelectors,
  MessageActions,
  SurveySelectors,
  useAppDispatch,
} from "state";
import { log } from "utils";

import { NewNodeButton } from "../NewNodeButton";
import { useConfirmDeleteNodes } from "../useConfirmDeleteNodes";
import { SingleAttributeComponentSwitch } from "./SingleAttributeComponentSwitch";
import { NodeComponentProps } from "./nodeTypes/nodeComponentPropTypes";

import styles from "./multipleAttributeComponentWrapperStyles";

type AttributeRowProps = {
  node: ArenaRecordNode;
  nodeDef: NodeDef<any>;
  onDelete: (node: ArenaRecordNode) => void;
  parentNodeUuid?: string;
};

const AttributeRow = memo((props: AttributeRowProps) => {
  const { node, nodeDef, onDelete, parentNodeUuid } = props;

  const onDeletePress = useCallback(() => onDelete(node), [node, onDelete]);

  return (
    <HView>
      <SingleAttributeComponentSwitch
        nodeDef={nodeDef}
        nodeUuid={node.uuid}
        parentNodeUuid={parentNodeUuid}
        style={styles.attributeComponentWrapper}
        wrapperStyle={styles.attributeComponentWrapper}
      />
      <IconButton icon="trash-can-outline" onPress={onDeletePress} />
    </HView>
  );
});

export const MultipleAttributeComponentWrapper = memo(
  (props: NodeComponentProps) => {
    const { nodeDef, parentNodeUuid } = props;

    log.debug(
      `rendering MultipleAttributeComponentWrapper for ${NodeDefs.getName(nodeDef)} - parentNodeUuid: ${parentNodeUuid}`,
    );

    const dispatch = useAppDispatch();
    const confirmDeleteNodes = useConfirmDeleteNodes();
    const lang = SurveySelectors.useCurrentSurveyPreferredLang();

    const { nodes } = DataEntrySelectors.useRecordChildNodes({
      parentEntityUuid: parentNodeUuid,
      nodeDef,
    });

    const maxCountReached = DataEntrySelectors.useIsNodeMaxCountReached({
      parentNodeUuid,
      nodeDef,
    });

    const nodeDefLabel = NodeDefs.getLabelOrName(nodeDef, lang);

    const onNewPress = useCallback(() => {
      const hasEmptyNodes = nodes.some((node) => Nodes.isValueBlank(node));
      if (hasEmptyNodes) {
        dispatch(
          MessageActions.setMessage({
            content:
              "Cannot add new value: an empty value already exists. Delete or update it first.",
          }),
        );
      } else {
        dispatch(DataEntryActions.addNewAttribute({ nodeDef, parentNodeUuid }));
      }
    }, [dispatch, nodeDef, nodes, parentNodeUuid]);

    const onDelete = useCallback(
      async (node: ArenaRecordNode) => {
        await confirmDeleteNodes({
          messageKey: "dataEntry:confirmDeleteValue.message",
          nodeUuids: [node.uuid],
          skipConfirm: Nodes.isValueBlank(node),
        });
      },
      [confirmDeleteNodes],
    );

    return (
      <VView style={styles.container}>
        {nodes.map((node) => (
          <AttributeRow
            key={node.uuid}
            node={node}
            nodeDef={nodeDef}
            onDelete={onDelete}
            parentNodeUuid={parentNodeUuid}
          />
        ))}
        <NewNodeButton
          disabled={maxCountReached}
          nodeDefLabel={nodeDefLabel}
          onPress={onNewPress}
        />
      </VView>
    );
  },
);

AttributeRow.displayName = "AttributeRow";
MultipleAttributeComponentWrapper.displayName =
  "MultipleAttributeComponentWrapper";
