import { useMemo } from "react";

import { Taxon, VernacularName } from "@openforis/arena-core";

import { Taxa } from "model/Taxa";
import { LanguageUtils } from "utils/LanguageUtils";

const calculateVernacularNamesCount = (taxon: Taxon) =>
  Object.values(taxon.vernacularNames ?? {}).reduce(
    (acc, vernacularNamesArray) => acc + vernacularNamesArray.length,
    0,
  );

const vernacularNameObjectToItem =
  (taxonItem: any) =>
  (vernacularNameObj: any): any => {
    const { uuid: vernacularNameUuid, props } = vernacularNameObj;
    const { name: vernacularName, lang: vernacularNameLangCode } = props;
    return {
      ...taxonItem,
      vernacularName,
      vernacularNameLangCode,
      vernacularNameUuid,
    };
  };

const getAllVernacularNameObjects = (
  vernacularNamesArray: VernacularName[][],
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
}): {
  vernacularNamesJoint: string;
  singleVernacularNameUuid: string | undefined;
} => {
  const parts = [];
  const vernacularNameEntries = Object.entries(taxonItem.vernacularNames ?? {});
  let singleVernacularNameUuid: string | undefined;
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
  if (vernacularNameEntries.length === 1) {
    // if there's only one vernacular name, we can keep its uuid for selection purposes
    const firstVernacularNameEntry = vernacularNameEntries[0];
    const vernacularNameObjects = firstVernacularNameEntry?.[1];
    if (vernacularNameObjects?.length === 1) {
      singleVernacularNameUuid = vernacularNameObjects[0]?.uuid;
    }
  }
  return { vernacularNamesJoint: parts.join(" - "), singleVernacularNameUuid };
};

export const useTaxa = ({
  survey,
  taxonomyUuid,
  joinVernacularNames = false,
}: any) => {
  const taxonIndex = useMemo(
    () => survey.refData?.taxonIndex ?? {},
    [survey.refData?.taxonIndex],
  );

  const { taxa, unknownTaxon, unlistedTaxon } = useMemo(() => {
    const taxaByCode: Record<string, Taxon> = {};
    const allTaxa: Taxon[] = Object.values(taxonIndex);
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
        vernacularNamesByLang,
      );
      if (vernacularNamesArray.length > 0) {
        if (joinVernacularNames) {
          const { vernacularNamesJoint, singleVernacularNameUuid } =
            joinVernacularNameObjects({ taxonItem });
          taxonItem.vernacularNamesJoint = vernacularNamesJoint;
          taxonItem.singleVernacularNameUuid = singleVernacularNameUuid;
        } else {
          const vernacularNames: VernacularName[] =
            getAllVernacularNameObjects(vernacularNamesArray);
          taxaReduced.push(
            ...vernacularNames.map(vernacularNameObjectToItem(taxonItem)),
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
  }, [joinVernacularNames, taxonIndex, taxonomyUuid]);

  return { taxa, unknownTaxon, unlistedTaxon };
};
