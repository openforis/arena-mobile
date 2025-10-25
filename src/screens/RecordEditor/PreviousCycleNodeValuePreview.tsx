import { CollapsiblePanel } from "components";
import { Cycles } from "model";
import { DataEntrySelectors, SurveySelectors } from "state";

import { NodeValuePreview } from "./NodeValuePreview";
import { NodeValuePreviewProps } from "./NodeValuePreview/NodeValuePreviewPropTypes";

const PreviousCycleNodeValuePreviewInnerComponent = (props: NodeValuePreviewProps) => {
  const { nodeDef } = props;

  const { previousCycleEntityUuid } =
    DataEntrySelectors.usePreviousCycleRecordPageEntity();

  const previousCycleValue =
    DataEntrySelectors.usePreviousCycleRecordAttributeValue({
      nodeDef,
      parentNodeUuid: previousCycleEntityUuid,
    });

  return <NodeValuePreview nodeDef={nodeDef} value={previousCycleValue} />;
};

export const PreviousCycleNodeValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef } = props;

  if (__DEV__) {
    console.log("rendering PreviousCycleNodeValuePreview");
  }

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
