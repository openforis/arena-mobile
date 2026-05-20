import { NodeDefs, Objects } from "@openforis/arena-core";

import { CollapsiblePanel, Text, VView } from "components";
import { Cycles } from "model";
import { DataEntrySelectors, SurveySelectors } from "state";
import { log } from "utils";

import { NodeValuePreview } from "./NodeValuePreview";
import { NodeValuePreviewProps } from "./NodeValuePreview/NodeValuePreviewPropTypes";

const PreviousCycleNodeValuePreviewInnerComponent = (
  props: NodeValuePreviewProps,
) => {
  const { nodeDef } = props;

  const { previousCycleEntityUuid } =
    DataEntrySelectors.usePreviousCycleRecordPageEntity();

  const previousCycleValues =
    DataEntrySelectors.usePreviousCycleRecordAttributeValues({
      nodeDef,
      parentNodeUuid: previousCycleEntityUuid,
    });

  if (!previousCycleValues || Objects.isEmpty(previousCycleValues)) {
    return <Text>---</Text>;
  }
  if (NodeDefs.isSingle(nodeDef)) {
    return (
      <NodeValuePreview nodeDef={nodeDef} value={previousCycleValues[0]} />
    );
  } else {
    return (
      <VView>
        {previousCycleValues.map(({ uuid, value }) => (
          <NodeValuePreview key={uuid} nodeDef={nodeDef} value={value} />
        ))}
      </VView>
    );
  }
};

export const PreviousCycleNodeValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef } = props;

  log.debug("rendering PreviousCycleNodeValuePreview");

  const isRootDef = SurveySelectors.useIsNodeDefRootKey(nodeDef);
  const prevCycle = DataEntrySelectors.usePreviousCycleKey();

  if (isRootDef) {
    return null;
  }

  return (
    <CollapsiblePanel
      headerKey="dataEntry:recordInPreviousCycle.valuePanelHeader"
      headerParams={{ prevCycle: Cycles.labelFunction(prevCycle) }}
    >
      <PreviousCycleNodeValuePreviewInnerComponent nodeDef={nodeDef} />
    </CollapsiblePanel>
  );
};
