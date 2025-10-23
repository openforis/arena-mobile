import { useMemo } from "react";

import { NodeDefs } from "@openforis/arena-core";

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
        // @ts-expect-error TS(2786): 'FormItem' cannot be used as a JSX component.
        <FormItem key={fieldKey} labelKey={`dataEntry:coordinate.${fieldKey}`}>
          <Text>{value[fieldKey]}</Text>
        </FormItem>
      ))}
    </VView>
  );
};

CoordinateValuePreview.propTypes = NodeValuePreviewPropTypes;
