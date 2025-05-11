import { Languages, LanguagesISO639part2 } from "@openforis/arena-core";
import { Taxa } from "model/Taxa";
import { useMemo } from "react";

const calculateVernacularNamesCount = (taxon) =>
  Object.values(taxon.vernacularNames).reduce(
    (acc, vernacularNamesArray) => acc + vernacularNamesArray.length,
    0
  );

const addVernacularNameObjectToItems =
  (items, taxonItem) => (vernacularNameObj) => {
    const { name: vernacularName, lang: vernacularNameLangCode } =
      vernacularNameObj.props;
    items.push({
      ...taxonItem,
      vernacularName,
      vernacularNameLangCode,
      vernacularNameUuid: vernacularNameObj.uuid,
    });
  };

const joinVernacularNameObjects = ({ taxonItem }) => {
  const vernacularNamesByLang = taxonItem.vernacularNames;
  return Object.entries(vernacularNamesByLang)
    .reduce((acc, [lang, vernacularNameObjects]) => {
      const vernacularNamesInLangJoint = vernacularNameObjects
        .map((vernacularNameObj) => {
          const { name: vernacularName } = vernacularNameObj.props;
          return vernacularName;
        })
        .join(" / ");
      const langText = LanguagesISO639part2[lang]?.["en"] ?? lang;
      acc.push(`${vernacularNamesInLangJoint} (${langText})`);
      return acc;
    }, [])
    .join(" - ");
};

export const useTaxa = ({
  survey,
  taxonomyUuid,
  joinVernacularNames = false,
}) => {
  const { taxa, unknownTaxon, unlistedTaxon } = useMemo(() => {
    const taxaByCode = {};
    const allTaxa = Object.values(survey.refData?.taxonIndex ?? {});
    const taxaReduced = allTaxa.reduce((acc, taxon) => {
      if (taxon.taxonomyUuid !== taxonomyUuid) {
        return acc;
      }
      const taxonCode = taxon.props.code;
      taxaByCode[taxonCode] = taxon;

      const taxonItem = {
        ...taxon,
        vernacularNamesCount: calculateVernacularNamesCount(taxon),
      };
      acc.push(taxonItem);
      const vernacularNamesByLang = taxon.vernacularNames;
      const vernacularNamesArray = Object.values(vernacularNamesByLang);
      if (vernacularNamesArray.length > 0) {
        if (joinVernacularNames) {
          taxonItem.vernacularNamesJoint = joinVernacularNameObjects({
            taxonItem,
          });
        } else {
          vernacularNamesArray.forEach((vernacularNameObjects) => {
            vernacularNameObjects.forEach(
              addVernacularNameObjectToItems(acc, taxonItem)
            );
          });
        }
      }
      return acc;
    }, []);
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
