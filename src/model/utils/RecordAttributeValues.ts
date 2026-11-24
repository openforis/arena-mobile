import {
  ArenaRecord,
  ArenaRecordNode,
  ArenaDictionary,
  ArenaNodeDefCoordinate,
  ArenaNodeDefExpression,
  NodeDefs,
  NodeDefType,
  RecordNodeValues,
  Numbers,
  Objects,
  RecordExpressionEvaluator,
  ArenaSurvey,
  ArenaUser,
  ArenaAnyNodeDef,
  ArenaPoint,
} from "@openforis/arena-core";

const coordinateAttributeMandatoryFields: Set<string> = new Set([
  RecordNodeValues.ValuePropsCoordinate.x,
  RecordNodeValues.ValuePropsCoordinate.y,
  RecordNodeValues.ValuePropsCoordinate.srs,
]);

const coordinateAttributeNumericFields = [
  RecordNodeValues.ValuePropsCoordinate.x,
  RecordNodeValues.ValuePropsCoordinate.y,
  RecordNodeValues.ValuePropsCoordinate.accuracy,
  RecordNodeValues.ValuePropsCoordinate.altitude,
  RecordNodeValues.ValuePropsCoordinate.altitudeAccuracy,
];

const cleanupAttributeValue = ({
  value,
  attributeDef,
  sideEffect = false,
}: {
  value: unknown;
  attributeDef: ArenaAnyNodeDef;
  sideEffect?: boolean;
}): unknown => {
  if (NodeDefs.getType(attributeDef) === NodeDefType.coordinate) {
    // coordinate values are objects
    const coordinateValue = value as Record<string, unknown>;
    const valueUpdated = sideEffect ? coordinateValue : { ...coordinateValue };
    const additionalFields: ReadonlySet<string> = new Set(
      NodeDefs.getCoordinateAdditionalFields(
        attributeDef as ArenaNodeDefCoordinate,
      ),
    );
    const fieldsToRemove = Object.keys(valueUpdated).filter(
      (field) =>
        !coordinateAttributeMandatoryFields.has(field) &&
        !additionalFields.has(field),
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

const possibleDistanceTargetExpressions: ArenaDictionary<string> = {
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
  nodeDef: ArenaAnyNodeDef;
}): string | null => {
  const validations = NodeDefs.getValidations(nodeDef);
  const distanceCallRegExp = new RegExp(distanceFunctionCallPattern);
  const distanceValidation = validations?.expressions?.find(
    (expression: ArenaNodeDefExpression) =>
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
  survey: ArenaSurvey;
  nodeDef: ArenaAnyNodeDef;
  record: ArenaRecord;
  node: ArenaRecordNode | undefined;
}): Promise<ArenaPoint | null> => {
  const distanceTargetExpression = extractDistanceTargetExpression({ nodeDef });
  if (distanceTargetExpression) {
    const distanceTarget = await new RecordExpressionEvaluator().evalExpression(
      {
        user: {} as ArenaUser,
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
