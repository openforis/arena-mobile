import { NodeDefs } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { Taxa } from "model";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { SurveySelectors } from "state";

import { useItemsFilter } from "../useItemsFilter";
import { useTaxa } from "./useTaxa";

const alwaysIncludeTaxaFunction = (item: any) => [Taxa.unlistedCode, Taxa.unknownCode].includes(item.props.code);

export const useTaxaFiltered = ({
  nodeDef,
  parentNodeUuid,
  joinVernacularNames = false
}: any) => {
  const survey = SurveySelectors.useCurrentSurvey();
  const taxonomyUuid = NodeDefs.getTaxonomyUuid(nodeDef);
  const { taxa, unknownTaxon, unlistedTaxon } = useTaxa({
    survey,
    taxonomyUuid,
    joinVernacularNames,
  });
  const taxaFiltered = useItemsFilter({
    nodeDef,
    parentNodeUuid,
    items: taxa,
    alwaysIncludeItemFunction: alwaysIncludeTaxaFunction,
  });
  return { taxa: taxaFiltered, unknownTaxon, unlistedTaxon };
};
