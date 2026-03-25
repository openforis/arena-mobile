import {
  ArenaRecord,
  LanguageCode,
  NodeDefs,
  Nodes,
  NodesMap,
  NodeValueFormatter,
  Objects,
  Records,
  Survey,
  Surveys,
} from "@openforis/arena-core";

import { SurveyDefs } from "model";

const getValuesByKeyOrSummaryAttributeFormatted = ({
  survey,
  lang,
  recordSummary,
  valuesWrapperProp,
  t = null,
}: {
  survey: Survey;
  lang: LanguageCode;
  recordSummary: ArenaRecord;
  valuesWrapperProp: string;
  t: any;
}) => {
  const { cycle: recordCycle } = recordSummary;
  const cycle = recordCycle!;
  const rootDef = Surveys.getNodeDefRoot({ survey });
  const nodeDefs =
    valuesWrapperProp === "keysObj"
      ? SurveyDefs.getRootKeyDefs({ survey, cycle })
      : Surveys.getNodeDefsIncludedInMultipleEntitySummary({
          survey,
          cycle,
          nodeDef: rootDef,
        });
  return nodeDefs.reduce(
    (acc, nodeDef) => {
      const nodeDefName = NodeDefs.getName(nodeDef);
      const value = Objects.path([valuesWrapperProp, nodeDefName])(
        recordSummary,
      );
      let valueFormatted = NodeValueFormatter.format({
        survey,
        cycle,
        nodeDef: nodeDef,
        value,
        showLabel: true,
        lang,
      });
      if (Objects.isEmpty(valueFormatted)) {
        valueFormatted = Objects.isEmpty(value)
          ? t?.("common:empty")
          : String(value);
      }
      acc[nodeDefName] = valueFormatted;
      return acc;
    },
    {} as Record<string, string>,
  );
};

const getValuesByKeyFormatted = ({
  survey,
  lang,
  recordSummary,
  t = null,
}: any) =>
  getValuesByKeyOrSummaryAttributeFormatted({
    survey,
    lang,
    recordSummary,
    valuesWrapperProp: "keysObj",
    t,
  });

const getValuesBySummaryAttributeFormatted = ({
  survey,
  lang,
  recordSummary,
  t = null,
}: any) =>
  getValuesByKeyOrSummaryAttributeFormatted({
    survey,
    lang,
    recordSummary,
    valuesWrapperProp: "summaryAttributesObj",
    t,
  });

const findNotRelevantNodeDefsWithValue = ({
  record,
  nodes,
}: {
  record: ArenaRecord;
  nodes: NodesMap;
}) => {
  const result = new Set<string>();
  for (const node of Object.values(nodes)) {
    const nodeDefUuid = node.nodeDefUuid;
    if (!result.has(nodeDefUuid)) {
      const parentNode = Records.getParent(node)(record);
      if (parentNode) {
        if (
          !Nodes.isChildApplicable(parentNode, nodeDefUuid) &&
          !Nodes.isValueBlank(node) &&
          !Nodes.isDefaultValueApplied(node)
        ) {
          result.add(nodeDefUuid);
        }
      }
    }
  }
  return result;
};

export const RecordsUtils = {
  getValuesByKeyFormatted,
  getValuesBySummaryAttributeFormatted,
  findNotRelevantNodeDefsWithValue,
};
