import { useMemo } from "react";

import { NodeValues, Surveys } from "@openforis/arena-core";

import { SurveySelectors } from "state/survey";

const findVernacularNameByUuid = ({
  taxon,
  vernacularNameUuid
}: any) => {
  const vernacularNamesByLang = taxon.vernacularNames;
  const vernacularNamesArray = Object.values(vernacularNamesByLang).flat();
  // @ts-expect-error TS(2769): No overload matches this call.
  return vernacularNamesArray.find(({ uuid }) => uuid === vernacularNameUuid);
};

export const useTaxonByNodeValue = ({
  value
}: any) => {
  const survey = SurveySelectors.useCurrentSurvey();

  return useMemo(() => {
    const taxonUuid = NodeValues.getValueTaxonUuid(value);
    const vernacularNameUuid = NodeValues.getValueVernacularNameUuid(value);
    if (!taxonUuid) return null;
    const { scientificName } = value;
    let taxon = Surveys.getTaxonByUuid({ survey, taxonUuid });

    if (vernacularNameUuid) {
      const vernacularNameObj = findVernacularNameByUuid({
        taxon,
        vernacularNameUuid,
      });
      if (vernacularNameObj) {
        const { name: vernacularName, lang: vernacularNameLangCode } =
          // @ts-expect-error TS(2571): Object is of type 'unknown'.
          vernacularNameObj.props;
        taxon = {
          ...taxon,
          // @ts-expect-error TS(2322): Type '{ vernacularName: any; vernacularNameLangCod... Remove this comment to see the full error message
          vernacularName,
          vernacularNameLangCode,
          vernacularNameUuid,
        };
      }
    }
    return scientificName ? { ...taxon, scientificName } : taxon;
  }, [survey, value]);
};
