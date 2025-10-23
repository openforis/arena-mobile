import React from "react";

import { Text, VView } from "components";
import { Taxa } from "model/Taxa";
import { NodeValuePreviewPropTypes } from "./NodeValuePreviewPropTypes";
import { useTaxonByNodeValue } from "./useTaxonByNodeValue";

export const TaxonValuePreview = (props: any) => {
  const { nodeDef, style, value } = props;

  const taxon = useTaxonByNodeValue({ value });

  if (!taxon) return null;

  // @ts-expect-error TS(2339): Property 'scientificNameAndCode' does not exist on... Remove this comment to see the full error message
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
