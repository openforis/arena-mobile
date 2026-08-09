import {
  NodeDefs,
  NodeDefType,
  NodeValueFormatter,
  Nodes,
  NodesMap,
  Numbers,
  Objects,
  RecordExpressionEvaluator,
  RecordValidations,
  Records,
  Surveys,
  Validations,
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
    const keyNode = Records.getDescendant({
      record,
      node: entity,
      nodeDefDescendant: keyDef,
    });
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
        const summaryNode = Records.getChildren(
          entity,
          summaryDef.uuid,
        )(record)[0];
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
      Nodes.isChildVisible(parentEntity, childDef.uuid) &&
      (!onlyInOwnPage ||
        NodeDefs.isDisplayInOwnPage(cycle)(childDef as NodeDefEntity)),
  ) as NodeDefEntity[];

type CompletionStats = { total: number; filled: number };

const toCompletionPercent = (stats: CompletionStats): number => {
  const { total, filled } = stats;
  if (total <= 0) return 100;
  return Math.round((filled / total) * 100);
};

const getChildEntityCompletionStats = ({
  survey,
  record,
  parentEntity,
  childDef,
  childEntity,
}: {
  survey: Survey;
  record: ArenaRecord;
  parentEntity: any;
  childDef: NodeDef<any>;
  childEntity: any;
}): CompletionStats => {
  if (NodeDefs.isSingle(childDef)) {
    return childEntity
      ? Records.getEntityCompletionStats({ survey, record, entity: childEntity })
      : { total: 1, filled: 0 };
  }
  const entities = Records.getChildren(parentEntity, childDef.uuid)(record);
  if (entities.length === 0) return { total: 1, filled: 0 };
  return entities.reduce(
    (acc: CompletionStats, entity: any) => {
      const stats = Records.getEntityCompletionStats({ survey, record, entity });
      return { total: acc.total + stats.total, filled: acc.filled + stats.filled };
    },
    { total: 0, filled: 0 },
  );
};

const getChildEntityCompletionPercent = (params: {
  survey: Survey;
  record: ArenaRecord;
  parentEntity: any;
  childDef: NodeDef<any>;
  childEntity: any;
}): number => toCompletionPercent(getChildEntityCompletionStats(params));

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

const distanceFunctionNames = ["distance", "geoDistance"];

const distanceFunctionNamesAlternation = distanceFunctionNames.join("|");

const distanceFunctionCallPattern = String.raw`\b(?:${distanceFunctionNamesAlternation})\b\s*\(`;

const distanceFunctionRegExp = (firstArgument: any, secondArgument: any) =>
  String.raw`\s*${distanceFunctionCallPattern}\s*(${firstArgument})\s*,\s*(${secondArgument})\s*\)`;

const extractDistanceTargetExpression = ({ nodeDef }: any): string | null => {
  const validations = NodeDefs.getValidations(nodeDef);
  const distanceCallRegExp = new RegExp(distanceFunctionCallPattern);
  const distanceValidation = validations?.expressions?.find(
    (expression: NodeDefExpression) =>
      distanceCallRegExp.test(expression.expression!),
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

const findAncestor = (params: {
  record: ArenaRecord;
  node: ArenaRecordNode;
  predicate: (node: ArenaRecordNode) => boolean;
}): ArenaRecordNode | null => {
  let result: ArenaRecordNode | null = null;
  const { record, node, predicate } = params;
  Records.visitAncestorsAndSelf(node, (visitedAncestor) => {
    if (!result && predicate(visitedAncestor)) {
      result = visitedAncestor;
    }
  })(record);
  return result;
};

const findMatchingEntityUuidForChildrenCountValidation = (params: {
  validationKey: string;
  entityNodeUuids: Set<string>;
}): string | undefined => {
  const { validationKey, entityNodeUuids } = params
  // children count validation key directly references the parent entity
  const parentUuid =
    RecordValidations.extractValidationChildrenCountKeyParentUuid(
      validationKey,
    );
  return parentUuid && entityNodeUuids.has(parentUuid)
    ? parentUuid
    : undefined;
};

const findMatchingEntityUuidForNodeValidation = (params: {
  record: ArenaRecord;
  validationKey: string;
  entityNodeUuids: Set<string>;
}): string | undefined => {
  const { record, validationKey, entityNodeUuids } = params
  const node = Records.getNodeByUuid(validationKey)(record);
  if (!node) return undefined;

  if (entityNodeUuids.has(node.uuid)) {
    // validation issue on the entity itself (e.g. duplicate key)
    return node.uuid;
  }
  // validation issue on a direct attribute of the entity: do not bubble
  // up errors/warnings belonging to nested (descendant) entities
  const parentEntity = Records.getParent(node)(record);
  return parentEntity && entityNodeUuids.has(parentEntity.uuid)
    ? parentEntity.uuid
    : undefined;
};

const findMatchingEntityUuid = (params: {
  record: ArenaRecord;
  validationKey: string;
  entityNodeUuids: Set<string>;
}): string | undefined => {
  const { record, validationKey, entityNodeUuids } = params
  return RecordValidations.isValidationChildrenCountKey(validationKey)
    ? findMatchingEntityUuidForChildrenCountValidation({
      validationKey,
      entityNodeUuids,
    })
    : findMatchingEntityUuidForNodeValidation({
      record,
      validationKey,
      entityNodeUuids,
    });
};

const findEntityNodesWithValidationIssues = (params: {
  record: ArenaRecord;
  entityNodeUuids: Set<string>;
}): { nodeUuidsWithErrors: Set<string>; nodeUuidsWithWarnings: Set<string> } => {
  const { record, entityNodeUuids } = params
  const nodeUuidsWithErrors = new Set<string>();
  const nodeUuidsWithWarnings = new Set<string>();

  const validation = Validations.getValidation(record);
  const fieldValidations = Validations.getFieldValidations(validation);

  for (const [validationKey, fieldValidation] of Object.entries(
    fieldValidations,
  )) {
    if (fieldValidation.valid) continue;

    const matchingEntityUuid = findMatchingEntityUuid({
      record,
      validationKey,
      entityNodeUuids,
    });
    if (!matchingEntityUuid) continue;

    const targetSet = Validations.calculateHasNestedErrors(fieldValidation)
      ? nodeUuidsWithErrors
      : nodeUuidsWithWarnings;
    targetSet.add(matchingEntityUuid);
  }
  return { nodeUuidsWithErrors, nodeUuidsWithWarnings };
};

const cleanupAttributeValue = ({
  value,
  attributeDef,
  sideEffect = false,
}: any) => {
  if (NodeDefs.getType(attributeDef) === NodeDefType.coordinate) {
    const valueUpdated = sideEffect ? value : { ...value };
    const additionalFields =
      NodeDefs.getCoordinateAdditionalFields(attributeDef);
    const fieldsToRemove = Object.keys(valueUpdated).filter(
      (field) =>
        !coordinateAttributeMandatoryFields.has(field) &&
        !additionalFields.includes(field),
    );
    for (const field of fieldsToRemove) {
      delete valueUpdated[field];
    }
    for (const field of coordinateAttributeNumericFields) {
      const fieldValue = valueUpdated[field];
      if (!Objects.isNil(fieldValue) && typeof fieldValue === "string") {
        valueUpdated[field] = Numbers.toNumber(fieldValue);
      }
    }
    return valueUpdated;
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
  const defs = SurveyDefs.getDescendantsInSingleEntities({
    survey,
    cycle,
    entityDef,
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
      if (!ancestorPrev) {
        return;
      }
      const applicablePrev = Records.isNodeApplicable({
        record: recordPrev,
        node: ancestorPrev,
      });
      const applicableNext = Records.isNodeApplicable({
        record: recordNext,
        node: visitedAncestor,
      });
      if (applicablePrev && !applicableNext) {
        topmostInapplicableAncestorDefUuid = visitedAncestor.nodeDefUuid;
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
  getChildEntityCompletionPercent,
  toCompletionPercent,
  getSiblingNode,
  getCoordinateDistanceTarget,
  findAncestor,
  findEntityNodesWithValidationIssues,
  cleanupAttributeValue,
  hasDescendantApplicableNodes,
  getApplicableDescendantDefs,
  getApplicableSummaryDefs,
};
