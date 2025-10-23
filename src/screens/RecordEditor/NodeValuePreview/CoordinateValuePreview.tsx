import { useMemo } from "react";

import { NodeDefs } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { FormItem, Text, VView } from "components";
import { NodeValuePreviewPropTypes } from "./NodeValuePreviewPropTypes";

export const CoordinateValuePreview = (props: any) => {
  const { nodeDef, value } = props;

  const fields = useMemo(() => {
    const includedExtraFields = NodeDefs.getCoordinateAdditionalFields(nodeDef);
    return ["x", "y", "srs", ...includedExtraFields];
  }, [nodeDef]);

  return (
    <VView>
      {fields.map((fieldKey) => (
        <FormItem key={fieldKey} labelKey={`dataEntry:coordinate.${fieldKey}`}>
          <Text>{value[fieldKey]}</Text>
        </FormItem>
      ))}
    </VView>
  );
};

CoordinateValuePreview.propTypes = NodeValuePreviewPropTypes;
