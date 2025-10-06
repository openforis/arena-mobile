import { NodeDefs, NodeValueFormatter, Objects } from "@openforis/arena-core";

import { SurveyDefs } from "./SurveyDefs";

const getKeyValuesByDefUuid = ({ survey, recordSummary }) => {
  const { cycle } = recordSummary;
  const rootKeyDefs = SurveyDefs.getRootKeyDefs({ survey, cycle });
  return rootKeyDefs.reduce((acc, keyDef) => {
    const value = Objects.path(["keysObj", NodeDefs.getName(keyDef)])(
      recordSummary
    );
    acc[keyDef.uuid] = value;
    return acc;
  }, {});
};

const getKeyValues = ({ survey, recordSummary }) =>
  Object.values(getKeyValuesByDefUuid({ survey, recordSummary }));

const getKeyValuesFormatted = ({ survey, recordSummary }) => {
  const { cycle } = recordSummary;
  const rootKeyDefs = SurveyDefs.getRootKeyDefs({ survey, cycle });
  const valuesByDefUuid = getKeyValuesByDefUuid({ survey, recordSummary });
  return rootKeyDefs.map((keyDef) => {
    const value = valuesByDefUuid[keyDef.uuid];
    return (
      NodeValueFormatter.format({ survey, cycle, nodeDef: keyDef, value }) ??
      value
    );
  });
};

export const RecordSummaries = {
  getKeyValuesByDefUuid,
  getKeyValues,
  getKeyValuesFormatted,
};
