import { useMemo } from "react";

import { Taxa } from "model/Taxa";
import { LanguageUtils } from "utils/LanguageUtils";

const calculateVernacularNamesCount = (taxon: any) => Object.values(taxon.vernacularNames).reduce(
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  (acc, vernacularNamesArray) => acc + vernacularNamesArray.length,
  0
);

const addVernacularNameObjectToItems =
  (items: any, taxonItem: any) => (vernacularNameObj: any) => {
    const { name: vernacularName, lang: vernacularNameLangCode } =
      vernacularNameObj.props;
    items.push({
      ...taxonItem,
      vernacularName,
      vernacularNameLangCode,
      vernacularNameUuid: vernacularNameObj.uuid,
    });
  };

const joinVernacularNameObjects = ({
  taxonItem
}: any) =>
  Object.entries(taxonItem.vernacularNames)
    .reduce((acc, [lang, vernacularNameObjects]) => {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const vernacularNamesInLangJoint = vernacularNameObjects
        .map((vernacularNameObj: any) => {
          const { name: vernacularName } = vernacularNameObj.props;
          return vernacularName;
        })
        .join(" / ");
      const langText = LanguageUtils.getLanguageLabel(lang);
      // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
      acc.push(`${vernacularNamesInLangJoint} (${langText})`);
      return acc;
    }, [])
    .join(" - ");

export const useTaxa = ({
  survey,
  taxonomyUuid,
  joinVernacularNames = false
}: any) => {
  const { taxa, unknownTaxon, unlistedTaxon } = useMemo(() => {
    const taxaByCode = {};
    const allTaxa = Object.values(survey.refData?.taxonIndex ?? {});
    const taxaReduced = allTaxa.reduce((acc, taxon) => {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      if (taxon.taxonomyUuid !== taxonomyUuid) {
        return acc;
      }
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const taxonCode = taxon.props.code;
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      taxaByCode[taxonCode] = taxon;

      const taxonItem = {
        // @ts-expect-error TS(2698): Spread types may only be created from object types... Remove this comment to see the full error message
        ...taxon,
        vernacularNamesCount: calculateVernacularNamesCount(taxon),
      };
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      acc.push(taxonItem);
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const vernacularNamesByLang = taxon.vernacularNames;
      const vernacularNamesArray = Object.values(vernacularNamesByLang);
      if (vernacularNamesArray.length > 0) {
        if (joinVernacularNames) {
          taxonItem.vernacularNamesJoint = joinVernacularNameObjects({
            taxonItem,
          });
        } else {
          vernacularNamesArray.forEach((vernacularNameObjects) => {
            // @ts-expect-error TS(2571): Object is of type 'unknown'.
            vernacularNameObjects.forEach(
              addVernacularNameObjectToItems(acc, taxonItem)
            );
          });
        }
      }
      return acc;
    }, []);
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const _unlistedTaxon = taxaByCode[Taxa.unlistedCode];
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const _unknownTaxon = taxaByCode[Taxa.unknownCode];
    return {
      taxa: taxaReduced,
      unknownTaxon: _unknownTaxon,
      unlistedTaxon: _unlistedTaxon,
    };
  }, [survey, taxonomyUuid]);

  return { taxa, unknownTaxon, unlistedTaxon };
};
