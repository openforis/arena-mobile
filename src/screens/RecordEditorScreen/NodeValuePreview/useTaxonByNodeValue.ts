import { useMemo } from "react";

import {
  RecordNodeValues,
  ArenaRecordNodeValueTaxon,
  Surveys,
  ArenaTaxon,
  ArenaVernacularName,
} from "@openforis/arena-core";

import { SurveySelectors } from "state/survey";
import { TaxonSearchItem } from "../NodeComponentSwitch/nodeTypes/NodeTaxonComponent/taxaSearch";

const findVernacularNameByUuid = ({
  taxon,
  vernacularNameUuid,
}: {
  taxon: ArenaTaxon;
  vernacularNameUuid: string;
}) => {
  const vernacularNamesByLang = taxon.vernacularNames!;
  const vernacularNamesArray: ArenaVernacularName[] = Object.values(
    vernacularNamesByLang,
  ).flat();
  return vernacularNamesArray.find(({ uuid }) => uuid === vernacularNameUuid);
};

export const useTaxonByNodeValue = ({
  value,
}: {
  value: ArenaRecordNodeValueTaxon | null | undefined;
}): TaxonSearchItem | null => {
  const survey = SurveySelectors.useCurrentSurvey()!;

  return useMemo(() => {
    const taxonUuid = RecordNodeValues.getValueTaxonUuid(value);
    const vernacularNameUuid =
      RecordNodeValues.getValueVernacularNameUuid(value);
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
