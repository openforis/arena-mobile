import React from "react";

import { ArenaRecordNodeValueTaxon } from "@openforis/arena-core";

import { Text, VView } from "components";
import { Taxa } from "model/utils/Taxa";
import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";
import { useTaxonByNodeValue } from "./useTaxonByNodeValue";

export const TaxonValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef } = props;
  const value = props.value as ArenaRecordNodeValueTaxon | undefined;

  const taxon = useTaxonByNodeValue({ value });

  if (!taxon) return null;

  const { scientificNameAndCode, vernacularNamePart } = Taxa.taxonToString({
    nodeDef,
    taxon,
  })!;

  return (
    <VView fullFlex>
      <Text variant="bodyLarge">{scientificNameAndCode}</Text>
      {vernacularNamePart && (
        <Text variant="bodyMedium">{vernacularNamePart}</Text>
      )}
    </VView>
  );
};
