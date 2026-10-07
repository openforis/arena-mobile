import { useMemo } from "react";

import { NodeDefs, Objects } from "@openforis/arena-core";

import { FormItem, HView, OpenMapButton, Text, VView } from "components";
import { SurveySelectors } from "state";
import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";

export const CoordinateValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef, value } = props;

  const srsIndex = SurveySelectors.useCurrentSurveySrsIndex();
  const hasPoint = Objects.isNotEmpty(value?.x) && Objects.isNotEmpty(value?.y);

  const fields = useMemo(() => {
    const includedExtraFields = NodeDefs.getCoordinateAdditionalFields(nodeDef);
    return ["x", "y", "srs", ...includedExtraFields];
  }, [nodeDef]);

  return (
    <HView>
      <VView>
        {fields.map((fieldKey) => (
          <FormItem
            key={fieldKey}
            labelKey={`dataEntry:coordinate.${fieldKey}`}
          >
            <Text>{value[fieldKey]}</Text>
          </FormItem>
        ))}
      </VView>
      {hasPoint && <OpenMapButton point={value} srsIndex={srsIndex} />}
    </HView>
  );
};
