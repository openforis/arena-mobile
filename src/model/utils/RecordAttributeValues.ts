import {
  ArenaRecord,
  ArenaRecordNode,
  Dictionary,
  NodeDef,
  NodeDefCoordinate,
  NodeDefExpression,
  NodeDefs,
  NodeDefType,
  NodeValues,
  Numbers,
  Objects,
  RecordExpressionEvaluator,
  Survey,
  User,
} from "@openforis/arena-core";

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

const cleanupAttributeValue = ({
  value,
  attributeDef,
  sideEffect = false,
}: {
  value: any;
  attributeDef: NodeDef<NodeDefType>;
  sideEffect?: boolean;
}) => {
  if (NodeDefs.getType(attributeDef) === NodeDefType.coordinate) {
    const valueUpdated = sideEffect ? value : { ...value };
    const additionalFields = NodeDefs.getCoordinateAdditionalFields(
      attributeDef as NodeDefCoordinate,
    );
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

const distanceFunctionRegExp = (
  firstArgument: string,
  secondArgument: string,
) =>
  String.raw`\s*${distanceFunctionCallPattern}\s*(${firstArgument})\s*,\s*(${secondArgument})\s*\)`;

const extractDistanceTargetExpression = ({
  nodeDef,
}: {
  nodeDef: NodeDef<NodeDefType>;
}): string | null => {
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

  let distanceTargetExpression: string | null = null;
  Object.values(possibleDistanceTargetExpressions).some(
    (possibleExpression) => {
      const expression = distanceValidation.expression!;
      // this or attribute name as 1st argument
      let match = expression.match(
        distanceFunctionRegExp(thisOrAttrName, possibleExpression),
      );
      if (match) {
        distanceTargetExpression = match[2]!;
        return true;
      }
      // this or attribute name as 2nd argument
      match = expression.match(
        distanceFunctionRegExp(possibleExpression, thisOrAttrName),
      );
      if (match) {
        distanceTargetExpression = match[1]!;
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
}: {
  survey: Survey;
  nodeDef: NodeDef<NodeDefType>;
  record: ArenaRecord;
  node: ArenaRecordNode | undefined;
}) => {
  const distanceTargetExpression = extractDistanceTargetExpression({ nodeDef });
  if (distanceTargetExpression) {
    const distanceTarget = await new RecordExpressionEvaluator().evalExpression(
      {
        user: {} as User,
        survey,
        record,
        node: node!,
        query: distanceTargetExpression,
      },
    );
    return distanceTarget;
  }
  return null;
};

export const RecordAttributeValues = {
  cleanupAttributeValue,
  extractDistanceTargetExpression,
  getCoordinateDistanceTarget,
};
