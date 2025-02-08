import { NodeDefs } from "@openforis/arena-core";

import { Taxa } from "model";
import { SurveySelectors } from "state";

import { useItemsFilter } from "../useItemsFilter";
import { useTaxa } from "./useTaxa";

const alwaysIncludeTaxaFunction = (item) =>
  [Taxa.unlistedCode, Taxa.unknownCode].includes(item.props.code);

export const useTaxaFiltered = ({ nodeDef, parentNodeUuid }) => {
  const survey = SurveySelectors.useCurrentSurvey();
  const taxonomyUuid = NodeDefs.getTaxonomyUuid(nodeDef);
  const { taxa, unknownTaxon, unlistedTaxon } = useTaxa({
    survey,
    taxonomyUuid,
  });
  const taxaFiltered = useItemsFilter({
    nodeDef,
    parentNodeUuid,
    items: taxa,
    alwaysIncludeItemFunction: alwaysIncludeTaxaFunction,
  });
  return { taxa: taxaFiltered, unknownTaxon, unlistedTaxon };
};
