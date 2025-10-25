import React from "react";

import { Text, VView } from "components";
import { Taxa } from "model/Taxa";
import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";
import { useTaxonByNodeValue } from "./useTaxonByNodeValue";

export const TaxonValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef, value } = props;

  const taxon = useTaxonByNodeValue({ value });

  if (!taxon) return null;

  const { scientificNameAndCode, vernacularNamePart } = Taxa.taxonToString({
    nodeDef,
    taxon,
  })!;

  return (
    <VView fullFlex transparent>
      <Text variant="bodyLarge">{scientificNameAndCode}</Text>
      {vernacularNamePart && (
        <Text variant="bodyMedium">{vernacularNamePart}</Text>
      )}
    </VView>
  );
};
