import { useMemo } from "react";

import {
  NodeValues,
  NodeValueTaxon,
  Surveys,
  Taxon,
  VernacularName,
} from "@openforis/arena-core";

import { SurveySelectors } from "state/survey";
import { TaxonSearchItem } from "../NodeComponentSwitch/nodeTypes/NodeTaxonComponent/taxaSearch";

const findVernacularNameByUuid = ({
  taxon,
  vernacularNameUuid,
}: {
  taxon: Taxon;
  vernacularNameUuid: string;
}) => {
  const vernacularNamesByLang = taxon.vernacularNames!;
  const vernacularNamesArray: VernacularName[] = Object.values(
    vernacularNamesByLang,
  ).flat();
  return vernacularNamesArray.find(({ uuid }) => uuid === vernacularNameUuid);
};

export const useTaxonByNodeValue = ({
  value,
}: {
  value: NodeValueTaxon | null | undefined;
}): TaxonSearchItem | null => {
  const survey = SurveySelectors.useCurrentSurvey()!;

  return useMemo(() => {
    const taxonUuid = NodeValues.getValueTaxonUuid(value);
    const vernacularNameUuid = NodeValues.getValueVernacularNameUuid(value);
    if (!taxonUuid) return null;
    const { scientificName } = value!;
    let taxon: TaxonSearchItem = Surveys.getTaxonByUuid({ survey, taxonUuid })!;

    if (vernacularNameUuid) {
      const vernacularNameObj = findVernacularNameByUuid({
        taxon,
        vernacularNameUuid,
      });
      if (vernacularNameObj) {
        const { name: vernacularName, lang: vernacularNameLangCode } =
          vernacularNameObj.props;
        taxon = {
          ...taxon,
          vernacularName,
          vernacularNameLangCode,
          vernacularNameUuid,
        };
      }
    }
    return scientificName ? { ...taxon, scientificName } : taxon;
  }, [survey, value]);
};
