import {
  NodeDefs,
  RecordNodeValueFormatter,
  Objects,
  ArenaValidation,
  Validations,
} from "@openforis/arena-core";

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
    const valueFormatted = RecordNodeValueFormatter.format({
      survey,
      cycle,
      nodeDef: keyDef,
      value,
    });
    return valueFormatted ?? value;
  });
};

// summaries have only the validation counts (see validationFromCountsColumns)
const hasErrors = (recordSummary: { validation?: ArenaValidation | null }) =>
  Validations.getErrorsCount(Validations.getValidation(recordSummary)) > 0;

export const RecordSummaries = {
  hasErrors,
  getKeyValue,
  getKeyValuesByDefUuid,
  getKeyValues,
  getKeyValuesFormatted,
};
