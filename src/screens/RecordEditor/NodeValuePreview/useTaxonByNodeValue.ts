import { useMemo } from "react";

import { NodeValues, Surveys, VernacularName } from "@openforis/arena-core";

import { SurveySelectors } from "state/survey";

const findVernacularNameByUuid = ({ taxon, vernacularNameUuid }: any) => {
  const vernacularNamesByLang = taxon.vernacularNames;
  const vernacularNamesArray: VernacularName[] = Object.values(
    vernacularNamesByLang
  ).flat() as VernacularName[];
  return vernacularNamesArray.find(({ uuid }) => uuid === vernacularNameUuid);
};

export const useTaxonByNodeValue = ({ value }: any): any => {
  const survey = SurveySelectors.useCurrentSurvey();

  return useMemo(() => {
    const taxonUuid = NodeValues.getValueTaxonUuid(value);
    const vernacularNameUuid = NodeValues.getValueVernacularNameUuid(value);
    if (!taxonUuid) return null;
    const { scientificName } = value;
    let taxon: any = Surveys.getTaxonByUuid({ survey, taxonUuid });

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
