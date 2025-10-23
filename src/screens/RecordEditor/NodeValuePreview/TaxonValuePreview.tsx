import React from "react";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Text, VView } from "components";
// @ts-expect-error TS(2307): Cannot find module 'model/Taxa' or its correspondi... Remove this comment to see the full error message
import { Taxa } from "model/Taxa";
import { NodeValuePreviewPropTypes } from "./NodeValuePreviewPropTypes";
import { useTaxonByNodeValue } from "./useTaxonByNodeValue";

export const TaxonValuePreview = (props: any) => {
  const { nodeDef, style, value } = props;

  const taxon = useTaxonByNodeValue({ value });

  if (!taxon) return null;

  const { scientificNameAndCode, vernacularNamePart } = Taxa.taxonToString({
    nodeDef,
    taxon,
  });

  return (
    <VView fullFlex style={style} transparent>
      <Text variant="bodyLarge">{scientificNameAndCode}</Text>
      {vernacularNamePart && (
        <Text variant="bodyMedium">{vernacularNamePart}</Text>
      )}
    </VView>
  );
};

TaxonValuePreview.propTypes = NodeValuePreviewPropTypes;
