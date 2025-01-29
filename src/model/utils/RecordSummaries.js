import { NodeDefs, NodeValueFormatter, Objects } from "@openforis/arena-core";

import { SurveyDefs } from "./SurveyDefs";

const getKeyValuesByDefUuid = ({ survey, recordSummary }) => {
  const { cycle } = recordSummary;
  const rootKeyDefs = SurveyDefs.getRootKeyDefs({ survey, cycle });
  return rootKeyDefs.reduce((acc, keyDef) => {
    const recordKeyProp = Objects.camelize(NodeDefs.getName(keyDef));
    acc[keyDef.uuid] = recordSummary[recordKeyProp];
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
