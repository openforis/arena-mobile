import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { NodeDefs, Nodes } from "@openforis/arena-core";

import { HView, IconButton, VView } from "components";
import {
  DataEntryActions,
  DataEntrySelectors,
  MessageActions,
  SurveySelectors,
  useConfirm,
} from "state";

import { NewNodeButton } from "../NewNodeButton";
import { SingleAttributeComponentSwitch } from "./SingleAttributeComponentSwitch";
import { NodeComponentPropTypes } from "./nodeTypes/nodeComponentPropTypes";

import styles from "./multipleAttributeComponentWrapperStyles";

export const MultipleAttributeComponentWrapper = (props) => {
  const { nodeDef, parentNodeUuid } = props;

  if (__DEV__) {
    console.log(
      `rendering MultipleAttributeComponentWrapper for ${nodeDef.props.name} - parentNodeUuid: ${parentNodeUuid}`
    );
  }

  const dispatch = useDispatch();
  const confirm = useConfirm();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  const { nodes } = DataEntrySelectors.useRecordChildNodes({
    parentEntityUuid: parentNodeUuid,
    nodeDef,
  });

  const nodeDefLabel = NodeDefs.getLabelOrName(nodeDef, lang);

  const onNewPress = useCallback(() => {
    const hasEmptyNodes = nodes.find(Nodes.isValueBlank);
    if (hasEmptyNodes) {
      dispatch(
        MessageActions.setMessage({
          content:
            "Cannot add new value: an empty value already exists. Delete or update it first.",
        })
      );
    } else {
      dispatch(
        DataEntryActions.addNewAttribute({
          nodeDef,
          parentNodeUuid,
        })
      );
    }
  }, [dispatch, nodeDef, nodes, parentNodeUuid]);

  const onDeletePress = (node) => async () => {
    const performDelete = () =>
      dispatch(DataEntryActions.deleteNodes([node.uuid]));

    if (
      Nodes.isValueBlank(node) ||
      (await confirm({ messageKey: "dataEntry:confirmDeleteValue.message" }))
    ) {
      performDelete();
    }
  };

  return (
    <VView style={styles.container}>
      {nodes.map((node) => (
        <HView key={node.uuid}>
          <SingleAttributeComponentSwitch
            nodeDef={nodeDef}
            nodeUuid={node.uuid}
            parentNodeUuid={parentNodeUuid}
            wrapperStyle={styles.attributeComponentWrapper}
          />
          <IconButton icon="trash-can-outline" onPress={onDeletePress(node)} />
        </HView>
      ))}
      <NewNodeButton nodeDefLabel={nodeDefLabel} onPress={onNewPress} />
    </VView>
  );
};

MultipleAttributeComponentWrapper.propTypes = NodeComponentPropTypes;
