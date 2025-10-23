import { NodeDefs, NodeValueFormatter, Objects } from "@openforis/arena-core";

import { SurveyDefs } from "./SurveyDefs";

const getKeyValue = ({
  keyDef,
  recordSummary
}: any) =>
  Objects.path(["keysObj", NodeDefs.getName(keyDef)])(recordSummary);

const getKeyValuesByDefUuid = ({
  survey,
  recordSummary
}: any) => {
  const { cycle } = recordSummary;
  const rootKeyDefs = SurveyDefs.getRootKeyDefs({ survey, cycle });
  return rootKeyDefs.reduce((acc, keyDef) => {
    const value = getKeyValue({ recordSummary, keyDef });
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    acc[keyDef.uuid] = value;
    return acc;
  }, {});
};

const getKeyValues = ({
  survey,
  recordSummary
}: any) =>
  Object.values(getKeyValuesByDefUuid({ survey, recordSummary }));

const getKeyValuesFormatted = ({
  survey,
  recordSummary
}: any) => {
  const { cycle } = recordSummary;
  const rootKeyDefs = SurveyDefs.getRootKeyDefs({ survey, cycle });
  const valuesByDefUuid = getKeyValuesByDefUuid({ survey, recordSummary });
  return rootKeyDefs.map((keyDef) => {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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
