import {
  NodeDefs,
  NodeDefType,
  NodeValueFormatter,
  Nodes,
  Numbers,
  Objects,
  RecordExpressionEvaluator,
  Records,
  Surveys,
} from "@openforis/arena-core";
import { valuePropsCoordinate } from "@openforis/arena-core/dist/node/nodeValueProps";
import { SurveyDefs } from "./SurveyDefs";

const EMPTY_VALUE = "---";

const coordinateAttributeMandatoryFields = [
  valuePropsCoordinate[valuePropsCoordinate.x],
  valuePropsCoordinate[valuePropsCoordinate.y],
  valuePropsCoordinate[valuePropsCoordinate.srs],
];

const coordinateAttributeNumericFields = [
  valuePropsCoordinate[valuePropsCoordinate.x],
  valuePropsCoordinate[valuePropsCoordinate.y],
  valuePropsCoordinate[valuePropsCoordinate.accuracy],
  valuePropsCoordinate[valuePropsCoordinate.altitude],
  valuePropsCoordinate[valuePropsCoordinate.altitudeAccuracy],
];

const yesNoValueByBooleanValue = {
  true: "yes",
  false: "no",
};

const getNodeName = ({ survey, record, nodeUuid }) => {
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
}) => {
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
}) =>
  getEntityKeysFormatted({
    survey,
    record,
    entity: Records.getRoot(record),
    lang,
    showLabel,
  });

const formatBooleanValue = ({ nodeDef, value, t }) => {
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
}) => {
  const { cycle } = record;
  const entityDef = Surveys.getNodeDefByUuid({
    survey,
    uuid: entity.nodeDefUuid,
  });
  const summaryDefs =
    summaryDefsParam ??
    SurveyDefs.getEntitySummaryDefs({
      survey,
      cycle,
      entityDef,
      onlyKeys,
    });
  return summaryDefs.reduce((acc, summaryDef) => {
    let formattedValue = "";
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
    } catch (error) {
      //ignore it
    }
    if (typeof formattedValue === "object") {
      formattedValue = JSON.stringify(formattedValue);
    }
    if (Objects.isEmpty(formattedValue)) {
      formattedValue = emptyValue;
    }
    acc[NodeDefs.getName(summaryDef)] = formattedValue;

    return acc;
  }, {});
};

const getApplicableChildrenEntityDefs = ({
  survey,
  nodeDef,
  parentEntity,
  cycle,
}) =>
  SurveyDefs.getChildrenDefs({ survey, nodeDef, cycle }).filter(
    (childDef) =>
      NodeDefs.isEntity(childDef) &&
      Nodes.isChildApplicable(parentEntity, childDef.uuid)
  );

const getSiblingNode = ({ record, parentEntity, node, offset }) => {
  const siblingNodes = Records.getChildren(
    parentEntity,
    node.nodeDefUuid
  )(record);
  const nodeIndex = siblingNodes.indexOf(node);
  const siblingIndex = nodeIndex + offset;
  const siblingNode = siblingNodes[siblingIndex];
  return { siblingNode, siblingIndex };
};

const possibleDistanceTargetExpressions = {
  simpleIdentifier: "\\w+",
  categoryItemProp: `categoryItemProp\\s*\\(.*\\)\\s*`,
  parentFunction: `parent\\s*\\(.*\\)\\s*`,
};

const distanceFunctionRegExp = (firstArgument, secondArgument) =>
  `\\s*distance\\s*\\(\\s*(${firstArgument})\\s*,\\s*(${secondArgument})\\s*\\)`;

const extractDistanceTargetExpression = ({ nodeDef }) => {
  const validations = NodeDefs.getValidations(nodeDef);
  const distanceValidation = validations?.expressions?.find((expression) =>
    /\s*distance\s*(.*)\s*/.test(expression.expression)
  );

  if (!distanceValidation) {
    return null;
  }
  const thisOrAttrName = `(?:this|${NodeDefs.getName(nodeDef)})`;

  let distanceTargetExpression = null;
  Object.values(possibleDistanceTargetExpressions).some(
    (possibleExpression) => {
      const expression = distanceValidation.expression;
      // this or attribute name as 1st argument
      let match = expression.match(
        distanceFunctionRegExp(thisOrAttrName, possibleExpression)
      );
      if (match) {
        distanceTargetExpression = match[2];
        return true;
      }
      // this or attribute name as 2nd argument
      match = expression.match(
        distanceFunctionRegExp(possibleExpression, thisOrAttrName)
      );
      if (match) {
        distanceTargetExpression = match[1];
        return true;
      }
      return false;
    }
  );
  return distanceTargetExpression;
};

const getCoordinateDistanceTarget = async ({
  survey,
  nodeDef,
  record,
  node,
}) => {
  const distanceTargetExpression = extractDistanceTargetExpression({ nodeDef });
  if (distanceTargetExpression) {
    const distanceTarget = await new RecordExpressionEvaluator().evalExpression(
      {
        survey,
        record,
        node,
        query: distanceTargetExpression,
      }
    );
    return distanceTarget;
  }
  return null;
};

const findAncestor = ({ record, node, predicate }) => {
  let result = null;
  Records.visitAncestorsAndSelf(node, (visitedAncestor) => {
    if (!result && predicate(visitedAncestor)) {
      result = visitedAncestor;
    }
  })(record);
  return result;
};

const cleanupAttributeValue = ({ value, attributeDef }) => {
  if (NodeDefs.getType(attributeDef) === NodeDefType.coordinate) {
    const additionalFields =
      NodeDefs.getCoordinateAdditionalFields(attributeDef);
    const fieldsToRemove = Object.keys(value).filter(
      (field) =>
        !coordinateAttributeMandatoryFields.includes(field) &&
        !additionalFields.includes(field)
    );
    fieldsToRemove.forEach((field) => {
      delete value[field];
    });
    coordinateAttributeNumericFields.forEach((field) => {
      const fieldValue = value[field];
      if (!Objects.isNil(fieldValue) && typeof fieldValue === "string") {
        value[field] = Numbers.toNumber(fieldValue);
      }
    });
  }
  return value;
};

const hasDescendantApplicableNodes = ({ record, parentEntity, nodeDef }) => {
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
}) => {
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
        hasDescendantApplicableNodes({ record, parentEntity, nodeDef }))
  );
};

const getApplicableSummaryDefs = ({
  survey,
  entityDef,
  record,
  parentEntity,
  onlyKeys = false,
  maxSummaryDefs = undefined,
}) => {
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
      hasDescendantApplicableNodes({ record, parentEntity, nodeDef })
  );
};

export const RecordNodes = {
  getNodeName,
  formatBooleanValue,
  getEntityKeysFormatted,
  getRootEntityKeysFormatted,
  getEntitySummaryValuesByNameFormatted,
  getApplicableChildrenEntityDefs,
  getSiblingNode,
  getCoordinateDistanceTarget,
  findAncestor,
  cleanupAttributeValue,
  hasDescendantApplicableNodes,
  getApplicableDescendantDefs,
  getApplicableSummaryDefs,
};
