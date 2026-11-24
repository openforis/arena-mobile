import {
  ArenaAnyNodeDef,
  ArenaSurvey,
  NodeDefs,
  RecordNodeValueFormatter,
  Objects,
  ArenaValidation,
  Validations,
} from "@openforis/arena-core";

import type { RecordSummaryValues } from "../RecordSummary";
import { SurveyDefs } from "./SurveyDefs";

// local or remote record summary
type RecordSummaryWithKeys = {
  cycle?: string;
  keysObj?: RecordSummaryValues;
};

type SurveyAndRecordSummary = {
  survey: ArenaSurvey;
  recordSummary: RecordSummaryWithKeys;
};

const getKeyValue = ({
  keyDef,
  recordSummary,
}: {
  keyDef: ArenaAnyNodeDef;
  recordSummary: RecordSummaryWithKeys;
}): unknown =>
  Objects.path<unknown>(["keysObj", NodeDefs.getName(keyDef)])(recordSummary);

const getKeyValuesByDefUuid = ({
  survey,
  recordSummary,
}: SurveyAndRecordSummary) => {
  const { cycle } = recordSummary;
  const rootKeyDefs = SurveyDefs.getRootKeyDefs({ survey, cycle });
  return rootKeyDefs.reduce((acc: Record<string, unknown>, keyDef) => {
    const value = getKeyValue({ recordSummary, keyDef });
    acc[keyDef.uuid] = value;
    return acc;
  }, {});
};

const getKeyValues = ({ survey, recordSummary }: SurveyAndRecordSummary) =>
  Object.values(getKeyValuesByDefUuid({ survey, recordSummary }));

const getKeyValuesFormatted = ({
  survey,
  recordSummary,
}: SurveyAndRecordSummary) => {
  const { cycle } = recordSummary;
  const rootKeyDefs = SurveyDefs.getRootKeyDefs({ survey, cycle });
  const valuesByDefUuid = getKeyValuesByDefUuid({ survey, recordSummary });
  return rootKeyDefs.map((keyDef) => {
    const value = valuesByDefUuid[keyDef.uuid];
    const valueFormatted = RecordNodeValueFormatter.format({
      survey,
      cycle: cycle!,
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
