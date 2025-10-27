import { useMemo } from "react";

import { Taxon, VernacularName } from "@openforis/arena-core";

import { Taxa } from "model/Taxa";
import { LanguageUtils } from "utils/LanguageUtils";

const calculateVernacularNamesCount = (taxon: Taxon) =>
  Object.values(taxon.vernacularNames ?? {}).reduce(
    (acc, vernacularNamesArray) => acc + vernacularNamesArray.length,
    0
  );

const vernacularNameObjectToItem =
  (taxonItem: any) =>
  (vernacularNameObj: any): any => {
    const { name: vernacularName, lang: vernacularNameLangCode } =
      vernacularNameObj.props;
    return {
      ...taxonItem,
      vernacularName,
      vernacularNameLangCode,
      vernacularNameUuid: vernacularNameObj.uuid,
    };
  };

const getAllVernacularNameObjects = (
  vernacularNamesArray: VernacularName[][]
) => {
  const result: VernacularName[] = [];
  for (const vernacularNameObjects of vernacularNamesArray) {
    for (const vernacularNameObject of vernacularNameObjects) {
      result.push(vernacularNameObject);
    }
  }
  return result;
};

const joinVernacularNameObjects = ({
  taxonItem,
}: {
  taxonItem: Taxon;
}): string => {
  const parts = [];
  const vernacularNameEntries = Object.entries(taxonItem.vernacularNames ?? {});
  for (const [lang, vernacularNameObjects] of vernacularNameEntries) {
    const vernacularNamesInLangJoint = vernacularNameObjects
      .map((vernacularNameObj: any) => {
        const { name: vernacularName } = vernacularNameObj.props;
        return vernacularName;
      })
      .join(" / ");
    const langText = LanguageUtils.getLanguageLabel(lang);
    parts.push(`${vernacularNamesInLangJoint} (${langText})`);
  }
  return parts.join(" - ");
};

export const useTaxa = ({
  survey,
  taxonomyUuid,
  joinVernacularNames = false,
}: any) => {
  const { taxa, unknownTaxon, unlistedTaxon } = useMemo(() => {
    const taxaByCode: Record<string, Taxon> = {};
    const allTaxa: Taxon[] = Object.values(survey.refData?.taxonIndex ?? {});
    const taxaReduced = [];
    for (const taxon of allTaxa) {
      if (taxon.taxonomyUuid !== taxonomyUuid) {
        continue;
      }
      const taxonCode = taxon.props.code;
      taxaByCode[taxonCode] = taxon;

      const taxonItem: any = {
        ...taxon,
        vernacularNamesCount: calculateVernacularNamesCount(taxon),
      };
      taxaReduced.push(taxonItem);
      const vernacularNamesByLang = taxon.vernacularNames ?? {};
      const vernacularNamesArray: VernacularName[][] = Object.values(
        vernacularNamesByLang
      );
      if (vernacularNamesArray.length > 0) {
        if (joinVernacularNames) {
          taxonItem.vernacularNamesJoint = joinVernacularNameObjects({
            taxonItem,
          });
        } else {
          const vernacularNames: VernacularName[] =
            getAllVernacularNameObjects(vernacularNamesArray);
          taxaReduced.push(
            ...vernacularNames.map(vernacularNameObjectToItem(taxonItem))
          );
        }
      }
    }
    const _unlistedTaxon = taxaByCode[Taxa.unlistedCode];
    const _unknownTaxon = taxaByCode[Taxa.unknownCode];
    return {
      taxa: taxaReduced,
      unknownTaxon: _unknownTaxon,
      unlistedTaxon: _unlistedTaxon,
    };
  }, [survey, taxonomyUuid]);

  return { taxa, unknownTaxon, unlistedTaxon };
};
