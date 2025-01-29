import { NodeDefs, NodeValueFormatter, Objects } from "@openforis/arena-core";
import { SurveyDefs } from "model";

const getValuesByKeyFormatted = ({ survey, lang, recordSummary, t = null }) => {
  const { cycle } = recordSummary;
  const rootDefKeys = SurveyDefs.getRootKeyDefs({ survey, cycle });
  return rootDefKeys.reduce((acc, keyDef) => {
    const recordKeyProp = Objects.camelize(NodeDefs.getName(keyDef));
    const value = recordSummary[recordKeyProp];
    let valueFormatted = NodeValueFormatter.format({
      survey,
      nodeDef: keyDef,
      value,
      showLabel: true,
      lang,
    });
    if (Objects.isEmpty(valueFormatted)) {
      if (Objects.isEmpty(value)) {
        valueFormatted = t ? t("common:empty") : null;
      } else {
        valueFormatted = String(value);
      }
    }
    acc[recordKeyProp] = valueFormatted;
    return acc;
  }, {});
};

export const RecordsUtils = {
  getValuesByKeyFormatted,
};
