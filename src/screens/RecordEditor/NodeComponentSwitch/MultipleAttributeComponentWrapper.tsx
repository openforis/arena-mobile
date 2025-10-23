import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { NodeDefs, Nodes } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { HView, IconButton, VView } from "components";
import {
  DataEntryActions,
  DataEntrySelectors,
  MessageActions,
  SurveySelectors,
  useConfirm,
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
} from "state";

import { NewNodeButton } from "../NewNodeButton";
import { SingleAttributeComponentSwitch } from "./SingleAttributeComponentSwitch";
import { NodeComponentPropTypes } from "./nodeTypes/nodeComponentPropTypes";

import styles from "./multipleAttributeComponentWrapperStyles";

export const MultipleAttributeComponentWrapper = (props: any) => {
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

  const maxCountReached = DataEntrySelectors.useIsNodeMaxCountReached({
    parentNodeUuid,
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

  const onDeletePress = (node: any) => async () => {
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
      {nodes.map((node: any) => <HView key={node.uuid}>
        <SingleAttributeComponentSwitch
          nodeDef={nodeDef}
          nodeUuid={node.uuid}
          parentNodeUuid={parentNodeUuid}
          wrapperStyle={styles.attributeComponentWrapper}
        />
        <IconButton icon="trash-can-outline" onPress={onDeletePress(node)} />
      </HView>)}
      // @ts-expect-error TS(2786): 'NewNodeButton' cannot be used as a JSX component.
      <NewNodeButton
        disabled={maxCountReached}
        nodeDefLabel={nodeDefLabel}
        onPress={onNewPress}
      />
    </VView>
  );
};

MultipleAttributeComponentWrapper.propTypes = NodeComponentPropTypes;
