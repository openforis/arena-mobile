import { NodeDefs, NodeValueFormatter, Objects } from "@openforis/arena-core";

import { SurveyDefs } from "./SurveyDefs";

const getKeyValue = ({ keyDef, recordSummary }: any) =>
  Objects.path(["keysObj", NodeDefs.getName(keyDef)])(recordSummary);

const getKeyValuesByDefUuid = ({ survey, recordSummary }: any) => {
  const { cycle } = recordSummary;
  const rootKeyDefs = SurveyDefs.getRootKeyDefs({ survey, cycle });
  return rootKeyDefs.reduce((acc: Record<string, any>, keyDef) => {
    const value = getKeyValue({ recordSummary, keyDef });
    acc[keyDef.uuid] = value;
    return acc;
  }, {});
};

const getKeyValues = ({ survey, recordSummary }: any) =>
  Object.values(getKeyValuesByDefUuid({ survey, recordSummary }));

const getKeyValuesFormatted = ({ survey, recordSummary }: any) => {
  const { cycle } = recordSummary;
  const rootKeyDefs = SurveyDefs.getRootKeyDefs({ survey, cycle });
  const valuesByDefUuid = getKeyValuesByDefUuid({ survey, recordSummary });
  return rootKeyDefs.map((keyDef) => {
    const value = valuesByDefUuid[keyDef.uuid];
    const valueFormatted = NodeValueFormatter.format({
      survey,
      cycle,
      nodeDef: keyDef,
      value,
    });
    return valueFormatted ?? value;
  });
};

export const RecordSummaries = {
  getKeyValue,
  getKeyValuesByDefUuid,
  getKeyValues,
  getKeyValuesFormatted,
};
