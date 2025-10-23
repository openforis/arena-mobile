// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { CollapsiblePanel } from "components";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { Cycles } from "model";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { DataEntrySelectors, SurveySelectors } from "state";

import { NodeValuePreview } from "./NodeValuePreview";
import { NodeValuePreviewPropTypes } from "./NodeValuePreview/NodeValuePreviewPropTypes";

const PreviousCycleNodeValuePreviewInnerComponent = (props: any) => {
  const { nodeDef } = props;

  const { previousCycleEntityUuid } =
    DataEntrySelectors.usePreviousCycleRecordPageEntity();

  const previousCycleValue =
    DataEntrySelectors.usePreviousCycleRecordAttributeValue({
      nodeDef,
      parentNodeUuid: previousCycleEntityUuid,
    });

  // @ts-expect-error TS(7027): Unreachable code detected.
  return <NodeValuePreview nodeDef={nodeDef} value={previousCycleValue} />;
};

PreviousCycleNodeValuePreviewInnerComponent.propTypes =
  NodeValuePreviewPropTypes;

export const PreviousCycleNodeValuePreview = (props: any) => {
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
      // @ts-expect-error TS(2304): Cannot find name 'headerKey'.
      headerKey="dataEntry:recordInPreviousCycle.valuePanelHeader"
      // @ts-expect-error TS(7027): Unreachable code detected.
      headerParams={{ prevCycle: Cycles.labelFunction(prevCycle) }}
    >
      // @ts-expect-error TS(2709): Cannot use namespace 'PreviousCycleNodeValuePrevie... Remove this comment to see the full error message
      <PreviousCycleNodeValuePreviewInnerComponent nodeDef={nodeDef} />
    </CollapsiblePanel>
  );
};

PreviousCycleNodeValuePreview.propTypes = NodeValuePreviewPropTypes;
