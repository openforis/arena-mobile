import { memo, useCallback } from "react";

import { ArenaRecordNode, NodeDefs, Nodes } from "@openforis/arena-core";

import { HView, IconButton, VView } from "components";
import {
  DataEntryActions,
  DataEntrySelectors,
  MessageActions,
  SurveySelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { log } from "utils";

import { NewNodeButton } from "../NewNodeButton";
import { SingleAttributeComponentSwitch } from "./SingleAttributeComponentSwitch";
import { NodeComponentProps } from "./nodeTypes/nodeComponentPropTypes";

import styles from "./multipleAttributeComponentWrapperStyles";

type AttributeRowProps = {
  node: ArenaRecordNode;
  nodeDef: any;
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
      `rendering MultipleAttributeComponentWrapper for ${nodeDef.props.name} - parentNodeUuid: ${parentNodeUuid}`,
    );

    const dispatch = useAppDispatch();
    const confirm = useConfirm();
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
        if (
          Nodes.isValueBlank(node) ||
          (await confirm({
            messageKey: "dataEntry:confirmDeleteValue.message",
          }))
        ) {
          dispatch(DataEntryActions.deleteNodes([node.uuid]));
        }
      },
      [confirm, dispatch],
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
