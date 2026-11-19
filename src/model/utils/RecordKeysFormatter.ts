import {
  ArenaRecord,
  ArenaRecordNode,
  ArenaDictionary,
  LanguageCode,
  ArenaNodeDefEntity,
  NodeDefs,
  RecordNodeValueFormatter,
  Objects,
  Records,
  ArenaSurvey,
  Surveys,
  ArenaAnyNodeDef,
} from "@openforis/arena-core";

import {
  RecordValueFormatters,
  SimpleTranslateFunction,
  SummaryValueFormatterParams,
} from "./RecordValueFormatters";
import { SurveyDefs } from "./SurveyDefs";

const EMPTY_VALUE = "---";

const getEntityKeysFormatted = ({
  survey,
  record,
  entity,
  lang,
  showLabel = true,
  emptyValue = "",
}: {
  survey: ArenaSurvey;
  record: ArenaRecord;
  entity: ArenaRecordNode;
  lang?: string;
  showLabel?: boolean;
  emptyValue?: string;
}): string[] => {
  const cycle = record.cycle!;
  const entityDef = Surveys.getNodeDefByUuid({
    survey,
    uuid: entity.nodeDefUuid,
  });
  const keyDefs = Surveys.getNodeDefKeys({ survey, nodeDef: entityDef, cycle });
  return keyDefs.map((keyDef) => {
    const keyNode = Records.getDescendant(entity, keyDef)(record);
    if (!keyNode) return emptyValue;
    return RecordNodeValueFormatter.format({
      survey,
      cycle,
      nodeDef: keyDef,
      node: keyNode,
      value: keyNode.value,
      showLabel,
      lang: lang as LanguageCode | undefined,
    });
  });
};

const getRootEntityKeysFormatted = ({
  survey,
  record,
  lang,
  showLabel = true,
}: {
  survey: ArenaSurvey;
  record: ArenaRecord;
  lang?: string;
  showLabel?: boolean;
}): string[] =>
  getEntityKeysFormatted({
    survey,
    record,
    entity: Records.getRoot(record)!,
    lang,
    showLabel,
  });

const getEntitySummaryValuesByNameFormatted = ({
  survey,
  record,
  entity,
  onlyKeys = true,
  lang,
  summaryDefs: summaryDefsParam = null,
  emptyValue = EMPTY_VALUE,
  t,
}: {
  survey: ArenaSurvey | undefined;
  record: ArenaRecord;
  entity: ArenaRecordNode;
  onlyKeys?: boolean;
  lang?: string;
  summaryDefs?: ArenaAnyNodeDef[] | null;
  emptyValue?: string | null;
  t: SimpleTranslateFunction;
}): ArenaDictionary<string> => {
  const cycle = record.cycle!;
  const entityDef = Surveys.getNodeDefByUuid({
    survey: survey!,
    uuid: entity.nodeDefUuid,
  }) as ArenaNodeDefEntity;
  const summaryDefs =
    summaryDefsParam ??
    SurveyDefs.getEntitySummaryDefs({
      survey: survey!,
      cycle,
      entityDef,
      onlyKeys,
    });
  const result: ArenaDictionary<string> = {};
  for (const summaryDef of summaryDefs) {
    let formattedValue: unknown;
    try {
      const summaryNode = Records.getChildren(
        entity,
        summaryDef.uuid,
      )(record)[0];
      if (summaryNode) {
        const formatter: (params: SummaryValueFormatterParams) => unknown =
          RecordValueFormatters.formatterByNodeDefType[
            NodeDefs.getType(summaryDef)
          ] ?? RecordNodeValueFormatter.format;
        formattedValue = formatter({
          survey: survey!,
          cycle,
          nodeDef: summaryDef,
          node: summaryNode,
          value: summaryNode.value,
          showLabel: true,
          lang: lang as LanguageCode | undefined,
          t,
        });
      }
    } catch {
      // ignore it
    }
    if (typeof formattedValue === "object") {
      formattedValue = JSON.stringify(formattedValue);
    }
    // emptyValue can be null: callers filter out the empty values
    result[NodeDefs.getName(summaryDef)] = (
      Objects.isEmpty(formattedValue) ? emptyValue : formattedValue
    ) as string;
  }
  return result;
};

const getAncestorsLabelAndKeysText = ({
  survey,
  record,
  node,
  lang,
  t,
}: {
  survey: ArenaSurvey;
  record: ArenaRecord;
  node: ArenaRecordNode;
  lang: LanguageCode;
  t: SimpleTranslateFunction;
}): string => {
  const nodeDef = Surveys.getNodeDefByUuid({
    survey,
    uuid: node.nodeDefUuid,
  });
  const leafLabel = NodeDefs.getLabelOrName(nodeDef, lang);
  const nameParts: string[] = [];
  let entity = Records.getParent(node)(record);
  while (entity) {
    const parentEntity = Records.getParent(entity)(record);
    const entityDef = Surveys.getNodeDefByUuid({
      survey,
      uuid: entity.nodeDefUuid,
    });
    if (
      NodeDefs.isRoot(entityDef) ||
      (NodeDefs.isMultiple(entityDef) && parentEntity)
    ) {
      const keyValuesByName = getEntitySummaryValuesByNameFormatted({
        survey,
        record,
        entity,
        lang,
        emptyValue: null,
        t,
      });
      const keyValuesText = Object.values(keyValuesByName)
        .filter((val) => Objects.isNotEmpty(val))
        .join(", ");
      const entityLabel = NodeDefs.getLabelOrName(entityDef, lang);
      nameParts.unshift(
        keyValuesText ? `${entityLabel}[${keyValuesText}]` : entityLabel,
      );
    }
    entity = parentEntity ?? undefined;
  }
  nameParts.push(leafLabel);
  return nameParts.join(" - ");
};

type RecordSummaryValuesFormattedParams = {
  survey: ArenaSurvey | undefined;
  lang: LanguageCode;
  recordSummary: ArenaRecord;
  t?: SimpleTranslateFunction | null;
};

const getRecordSummaryValuesByKeyOrSummaryAttributeFormatted = ({
  survey: surveyParam,
  lang,
  recordSummary,
  valuesWrapperProp,
  t = null,
}: RecordSummaryValuesFormattedParams & {
  valuesWrapperProp: string;
}): Record<string, string> => {
  const { cycle: recordCycle } = recordSummary;
  const cycle = recordCycle!;
  const survey = surveyParam!;
  const rootDef = Surveys.getNodeDefRoot({ survey });
  const defs =
    valuesWrapperProp === "keysObj"
      ? SurveyDefs.getRootKeyDefs({ survey, cycle })
      : Surveys.getNodeDefsIncludedInMultipleEntitySummary({
          survey,
          cycle,
          nodeDef: rootDef,
        });
  return defs.reduce(
    (acc, nodeDef) => {
      const nodeDefName = NodeDefs.getName(nodeDef);
      const value = Objects.path([valuesWrapperProp, nodeDefName])(
        recordSummary,
      );
      let valueFormatted: string | undefined = RecordNodeValueFormatter.format({
        survey,
        cycle,
        nodeDef,
        value,
        showLabel: true,
        lang,
      });
      if (Objects.isEmpty(valueFormatted)) {
        valueFormatted = Objects.isEmpty(value)
          ? t?.("common:empty")
          : String(value);
      }
      acc[nodeDefName] = valueFormatted!;
      return acc;
    },
    {} as Record<string, string>,
  );
};

const getRecordSummaryValuesByKeyFormatted = ({
  survey,
  lang,
  recordSummary,
  t = null,
}: RecordSummaryValuesFormattedParams): Record<string, string> =>
  getRecordSummaryValuesByKeyOrSummaryAttributeFormatted({
    survey,
    lang,
    recordSummary,
    valuesWrapperProp: "keysObj",
    t,
  });

const getRecordSummaryValuesBySummaryAttributeFormatted = ({
  survey,
  lang,
  recordSummary,
  t = null,
}: RecordSummaryValuesFormattedParams): Record<string, string> =>
  getRecordSummaryValuesByKeyOrSummaryAttributeFormatted({
    survey,
    lang,
    recordSummary,
    valuesWrapperProp: "summaryAttributesObj",
    t,
  });

export const RecordKeysFormatter = {
  getEntityKeysFormatted,
  getRootEntityKeysFormatted,
  getEntitySummaryValuesByNameFormatted,
  getAncestorsLabelAndKeysText,
  getRecordSummaryValuesByKeyFormatted,
  getRecordSummaryValuesBySummaryAttributeFormatted,
};
