import {
  NodeDefs,
  NodeDefType,
  NodeValueFormatter,
  Nodes,
  NodesMap,
  Numbers,
  Objects,
  RecordExpressionEvaluator,
  Records,
  Surveys,
  NodeDefEntity,
  NodeDef,
  NodeDefExpression,
  NodeValues,
  ArenaRecord,
  ArenaRecordNode,
  Dictionary,
  Survey,
  LanguageCode,
} from "@openforis/arena-core";

import { TranslateFunction } from "localization";

import { SurveyDefs } from "./SurveyDefs";

const EMPTY_VALUE = "---";

const coordinateAttributeMandatoryFields: Set<string> = new Set([
  NodeValues.ValuePropsCoordinate.x,
  NodeValues.ValuePropsCoordinate.y,
  NodeValues.ValuePropsCoordinate.srs,
]);

const coordinateAttributeNumericFields = [
  NodeValues.ValuePropsCoordinate.x,
  NodeValues.ValuePropsCoordinate.y,
  NodeValues.ValuePropsCoordinate.accuracy,
  NodeValues.ValuePropsCoordinate.altitude,
  NodeValues.ValuePropsCoordinate.altitudeAccuracy,
];

const yesNoValueByBooleanValue: Record<string, string> = {
  true: "yes",
  false: "no",
};

const getNodeName = ({ survey, record, nodeUuid }: any): string | null => {
  const node = Records.getNodeByUuid(nodeUuid)(record);
  if (node) {
    const nodeDef = Surveys.getNodeDefByUuid({
      survey,
      uuid: node.nodeDefUuid,
    });
    return NodeDefs.getName(nodeDef);
  }
  return null;
};

const getEntityKeysFormatted = ({
  survey,
  record,
  entity,
  lang,
  showLabel = true,
  emptyValue = "",
}: any): string[] => {
  const { cycle } = record;
  const entityDef = Surveys.getNodeDefByUuid({
    survey,
    uuid: entity.nodeDefUuid,
  });
  const keyDefs = Surveys.getNodeDefKeys({ survey, nodeDef: entityDef, cycle });
  return keyDefs.map((keyDef) => {
    const keyNode = Records.getChild(entity, keyDef.uuid)(record);
    if (!keyNode) return emptyValue;
    return NodeValueFormatter.format({
      survey,
      cycle,
      nodeDef: keyDef,
      node: keyNode,
      value: keyNode.value,
      showLabel,
      lang,
    });
  });
};

const getRootEntityKeysFormatted = ({
  survey,
  record,
  lang,
  showLabel = true,
}: any): string[] =>
  getEntityKeysFormatted({
    survey,
    record,
    entity: Records.getRoot(record),
    lang,
    showLabel,
  });

const formatBooleanValue = ({ nodeDef, value, t }: any): string => {
  if (Objects.isEmpty(value)) return "";
  const booleanValueString = String(String(value) === "true");
  const labelValue = nodeDef.props.labelValue ?? "trueFalse";
  const labelKey =
    labelValue === "trueFalse"
      ? booleanValueString
      : yesNoValueByBooleanValue[booleanValueString];
  return t(`common:${labelKey}`);
};

const getEntitySummaryValuesByNameFormatted = ({
  survey,
  record,
  entity,
  onlyKeys = true,
  lang,
  summaryDefs: summaryDefsParam = null,
  emptyValue = EMPTY_VALUE,
  t,
}: any): Dictionary<string> => {
  const { cycle } = record;
  const entityDef = Surveys.getNodeDefByUuid({
    survey,
    uuid: entity.nodeDefUuid,
  }) as NodeDefEntity;
  const summaryDefs =
    summaryDefsParam ??
    SurveyDefs.getEntitySummaryDefs({
      survey,
      cycle,
      entityDef,
      onlyKeys,
    });
  return summaryDefs.reduce(
    (acc: Dictionary<string>, summaryDef: NodeDef<any, any>) => {
      let formattedValue: string;
      try {
        const summaryNode = Records.getChild(entity, summaryDef.uuid)(record);
        if (!summaryNode) {
          formattedValue = "";
        } else if (NodeDefs.getType(summaryDef) === NodeDefType.boolean) {
          formattedValue = formatBooleanValue({
            nodeDef: summaryDef,
            value: summaryNode.value,
            t,
          });
        } else {
          formattedValue = NodeValueFormatter.format({
            survey,
            cycle,
            nodeDef: summaryDef,
            node: summaryNode,
            value: summaryNode.value,
            showLabel: true,
            lang,
          });
        }
      } catch {
        // ignore it
        formattedValue = "";
      }
      if (typeof formattedValue === "object") {
        formattedValue = JSON.stringify(formattedValue);
      }
      if (Objects.isEmpty(formattedValue)) {
        formattedValue = emptyValue;
      }
      acc[NodeDefs.getName(summaryDef)] = formattedValue;

      return acc;
    },
    {},
  );
};

const getApplicableChildrenEntityDefs = ({
  survey,
  nodeDef,
  parentEntity,
  cycle,
  onlyInOwnPage = false,
}: any): NodeDefEntity[] =>
  SurveyDefs.getChildrenDefs({ survey, nodeDef, cycle }).filter(
    (childDef) =>
      NodeDefs.isEntity(childDef) &&
      Nodes.isChildApplicable(parentEntity, childDef.uuid) &&
      (!onlyInOwnPage ||
        NodeDefs.isDisplayInOwnPage(cycle)(childDef as NodeDefEntity)),
  ) as NodeDefEntity[];

const getSiblingNode = ({
  record,
  parentEntity,
  node,
  offset,
}: any): { siblingNode: ArenaRecordNode | undefined; siblingIndex: number } => {
  const siblingNodes = Records.getChildren(
    parentEntity,
    node.nodeDefUuid,
  )(record);
  const nodeIndex = siblingNodes.indexOf(node);
  const siblingIndex = nodeIndex + offset;
  const siblingNode = siblingNodes[siblingIndex];
  return { siblingNode, siblingIndex };
};

const functionCallExpression = (functionName: string): string =>
  String.raw`${functionName}\s*\((?:[^()]*|\([^()]*\))*\)`;

const possibleDistanceTargetExpressions: Dictionary<string> = {
  simpleIdentifier: String.raw`\w+`,
  categoryItemProp: functionCallExpression("categoryItemProp"),
  parentFunction: functionCallExpression("parent"),
};

const distanceFunctionRegExp = (firstArgument: any, secondArgument: any) =>
  String.raw`\s*distance\s*\(\s*(${firstArgument})\s*,\s*(${secondArgument})\s*\)`;

const extractDistanceTargetExpression = ({ nodeDef }: any): string | null => {
  const validations = NodeDefs.getValidations(nodeDef);
  const distanceValidation = validations?.expressions?.find(
    (expression: NodeDefExpression) =>
      new RegExp(functionCallExpression("distance")).test(
        expression.expression!,
      ),
  );

  if (!distanceValidation) {
    return null;
  }
  const thisOrAttrName = `(?:this|${NodeDefs.getName(nodeDef)})`;

  let distanceTargetExpression = null;
  Object.values(possibleDistanceTargetExpressions).some(
    (possibleExpression) => {
      const expression = distanceValidation.expression!;
      // this or attribute name as 1st argument
      let match = expression.match(
        distanceFunctionRegExp(thisOrAttrName, possibleExpression),
      );
      if (match) {
        distanceTargetExpression = match[2];
        return true;
      }
      // this or attribute name as 2nd argument
      match = expression.match(
        distanceFunctionRegExp(possibleExpression, thisOrAttrName),
      );
      if (match) {
        distanceTargetExpression = match[1];
        return true;
      }
      return false;
    },
  );
  return distanceTargetExpression;
};

const getCoordinateDistanceTarget = async ({
  survey,
  nodeDef,
  record,
  node,
}: any) => {
  const distanceTargetExpression = extractDistanceTargetExpression({ nodeDef });
  if (distanceTargetExpression) {
    const distanceTarget = await new RecordExpressionEvaluator().evalExpression(
      {
        user: {} as any,
        survey,
        record,
        node,
        query: distanceTargetExpression,
      },
    );
    return distanceTarget;
  }
  return null;
};

const findAncestor = ({
  record,
  node,
  predicate,
}: {
  record: ArenaRecord;
  node: ArenaRecordNode;
  predicate: (node: ArenaRecordNode) => boolean;
}): ArenaRecordNode | null => {
  let result: ArenaRecordNode | null = null;
  Records.visitAncestorsAndSelf(node, (visitedAncestor) => {
    if (!result && predicate(visitedAncestor)) {
      result = visitedAncestor;
    }
  })(record);
  return result;
};

const cleanupAttributeValue = ({ value, attributeDef }: any) => {
  if (NodeDefs.getType(attributeDef) === NodeDefType.coordinate) {
    const additionalFields =
      NodeDefs.getCoordinateAdditionalFields(attributeDef);
    const fieldsToRemove = Object.keys(value).filter(
      (field) =>
        !coordinateAttributeMandatoryFields.has(field) &&
        !additionalFields.includes(field),
    );
    for (const field of fieldsToRemove) {
      delete value[field];
    }
    for (const field of coordinateAttributeNumericFields) {
      const fieldValue = value[field];
      if (!Objects.isNil(fieldValue) && typeof fieldValue === "string") {
        value[field] = Numbers.toNumber(fieldValue);
      }
    }
  }
  return value;
};

const hasDescendantApplicableNodes = ({
  record,
  parentEntity,
  nodeDef,
}: any): boolean => {
  const descendants = Records.getDescendantsOrSelf({
    record,
    node: parentEntity,
    nodeDefDescendant: nodeDef,
  });
  return descendants.some((node) => Records.isNodeApplicable({ record, node }));
};

const getApplicableDescendantDefs = ({
  survey,
  entityDef,
  record,
  parentEntity,
  onlyAttributes = true,
}: any): NodeDef<any>[] => {
  const { cycle } = record;
  const defs = Surveys.getDescendantsInSingleEntities({
    survey,
    cycle,
    nodeDef: entityDef,
  });
  return defs.filter(
    (nodeDef) =>
      (!onlyAttributes || NodeDefs.isAttribute(nodeDef)) &&
      (Objects.isEmpty(NodeDefs.getApplicable(nodeDef)) ||
        hasDescendantApplicableNodes({ record, parentEntity, nodeDef })),
  );
};

const getApplicableSummaryDefs = ({
  survey,
  entityDef,
  record,
  parentEntity,
  onlyKeys = false,
  maxSummaryDefs = undefined,
}: any): NodeDef<any>[] => {
  const { cycle } = record;
  const summaryDefs = SurveyDefs.getEntitySummaryDefs({
    survey,
    cycle,
    entityDef,
    onlyKeys,
    maxSummaryDefs,
  });
  return summaryDefs.filter(
    (nodeDef) =>
      Objects.isEmpty(NodeDefs.getApplicable(nodeDef)) ||
      hasDescendantApplicableNodes({ record, parentEntity, nodeDef }),
  );
};

const getAncestorsLabelAndKeysText = ({
  survey,
  record,
  node,
  lang,
  t,
}: {
  survey: Survey;
  record: ArenaRecord;
  node: ArenaRecordNode;
  lang: LanguageCode;
  t: TranslateFunction;
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

const getRecordSummaryValuesByKeyOrSummaryAttributeFormatted = ({
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
  t?: any;
}): Record<string, string> => {
  const { cycle: recordCycle } = recordSummary;
  const cycle = recordCycle!;
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
      let valueFormatted: string = NodeValueFormatter.format({
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
      acc[nodeDefName] = valueFormatted;
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
}: any): Record<string, string> =>
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
}: any): Record<string, string> =>
  getRecordSummaryValuesByKeyOrSummaryAttributeFormatted({
    survey,
    lang,
    recordSummary,
    valuesWrapperProp: "summaryAttributesObj",
    t,
  });

const findTopmostNewlyInapplicableAncestorDefUuid = ({
  node,
  recordPrev,
  recordNext,
}: {
  node: ArenaRecordNode;
  recordPrev: ArenaRecord;
  recordNext: ArenaRecord;
}) => {
  let topmostInapplicableAncestorDefUuid: string | null = null;

  Records.visitAncestorsAndSelf(
    node,
    (visitedAncestor) => {
      if (visitedAncestor.uuid === node.uuid) {
        // skip the node itself, we are looking for ancestors only
        return;
      }
      const ancestorPrev = Records.getNodeByUuid(visitedAncestor.uuid)(
        recordPrev,
      );
      if (ancestorPrev) {
        const ancestorApplicablePrev = Records.isNodeApplicable({
          record: recordPrev,
          node: ancestorPrev,
        });
        const ancestorApplicableNext = Records.isNodeApplicable({
          record: recordNext,
          node: visitedAncestor,
        });
        if (ancestorApplicablePrev && !ancestorApplicableNext) {
          topmostInapplicableAncestorDefUuid = visitedAncestor.nodeDefUuid;
        }
      }
    },
    () => !!topmostInapplicableAncestorDefUuid,
  )(recordNext);

  return topmostInapplicableAncestorDefUuid;
};

const findNewlyInapplicableDefUuidsWithValue = ({
  recordPrev,
  recordNext,
  nodes,
}: {
  recordPrev: ArenaRecord;
  recordNext: ArenaRecord;
  nodes: NodesMap;
}): Set<string> => {
  const result = new Set<string>();
  for (const node of Object.values(nodes)) {
    const { nodeDefUuid } = node;
    const parentNode = Records.getParent(node)(recordNext);
    if (!parentNode) {
      continue;
    }
    const nodePrev = Records.getNodeByUuid(node.uuid)(recordPrev);
    const hadUserInputValue = nodePrev && Nodes.hasUserInputValue(nodePrev);
    const applicablePrev = nodePrev
      ? Records.isNodeApplicable({ record: recordPrev, node: nodePrev })
      : true;
    const applicableNext = Records.isNodeApplicable({
      record: recordNext,
      node,
    });

    if (applicablePrev && !applicableNext && hadUserInputValue) {
      const topmostInapplicableAncestorDefUuid: string | null =
        findTopmostNewlyInapplicableAncestorDefUuid({
          node,
          recordNext,
          recordPrev,
        });
      result.add(topmostInapplicableAncestorDefUuid ?? nodeDefUuid);
    }
  }
  return result;
};

export const RecordUtils = {
  getNodeName,
  formatBooleanValue,
  getEntityKeysFormatted,
  getRootEntityKeysFormatted,
  getEntitySummaryValuesByNameFormatted,
  getAncestorsLabelAndKeysText,
  getRecordSummaryValuesByKeyFormatted,
  getRecordSummaryValuesBySummaryAttributeFormatted,
  findNewlyInapplicableDefUuidsWithValue,
  getApplicableChildrenEntityDefs,
  getSiblingNode,
  getCoordinateDistanceTarget,
  findAncestor,
  cleanupAttributeValue,
  hasDescendantApplicableNodes,
  getApplicableDescendantDefs,
  getApplicableSummaryDefs,
};
