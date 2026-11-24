import {
  Surveys,
  NodeDefs,
  NodeDefType,
  Categories,
  ArenaSurvey,
  ArenaAnyNodeDef,
  ArenaNodeDefEntity,
  LanguageCode,
  ArenaNodeDefCode,
  Objects,
  ArenaNodeDefFile,
  ArenaNodeDefExpression,
  ArenaSurveyFile,
} from "@openforis/arena-core";

const samplingPointDataCategoryName = "sampling_point_data";

const mobileNodeDefFilter =
  ({
    cycle,
  }: {
    cycle: string;
  }): ((
    value: ArenaAnyNodeDef,
    index?: number,
    array?: ArenaAnyNodeDef[],
  ) => boolean) =>
  (childDef) =>
    !NodeDefs.isHidden(childDef) &&
    !NodeDefs.isHiddenInMobile(cycle)(childDef) &&
    NodeDefs.isInCycle(cycle)(childDef);

const getRootKeyDefs = ({
  survey,
  cycle,
}: {
  survey: ArenaSurvey;
  cycle?: string | null;
}) => {
  const rootDef = Surveys.getNodeDefRoot({ survey });
  return Surveys.getNodeDefKeys({
    survey,
    nodeDef: rootDef,
    cycle,
  });
};

const isRootKeyDef = ({
  survey,
  cycle,
  nodeDef,
}: {
  survey: ArenaSurvey;
  cycle?: string | null;
  nodeDef: ArenaAnyNodeDef;
}) => {
  if (!NodeDefs.isKey(nodeDef)) return false;
  const rootKeyDefs = getRootKeyDefs({ survey, cycle });
  return rootKeyDefs.includes(nodeDef);
};

const getChildrenDefs = ({
  survey,
  nodeDef,
  cycle,
}: {
  survey: ArenaSurvey;
  nodeDef: ArenaAnyNodeDef;
  cycle: string;
}) =>
  Surveys.getNodeDefChildrenSorted({
    survey,
    nodeDef,
    cycle,
    includeAnalysis: false,
  }).filter(mobileNodeDefFilter({ cycle }));

const getDescendantsInSingleEntities = ({
  survey,
  cycle,
  entityDef,
}: {
  survey: ArenaSurvey;
  cycle: string;
  entityDef: ArenaNodeDefEntity;
}) =>
  Surveys.getDescendantsInSingleEntities({
    survey,
    cycle,
    nodeDef: entityDef,
  }).filter(mobileNodeDefFilter({ cycle }));

const getEntitySummaryDefs = ({
  survey,
  entityDef,
  cycle,
  onlyKeys = true,
  maxSummaryDefs = 3,
}: {
  survey: ArenaSurvey;
  entityDef: ArenaNodeDefEntity;
  cycle: string;
  onlyKeys?: boolean;
  maxSummaryDefs?: number;
}) => {
  const keyDefs = Surveys.getNodeDefKeys({
    survey,
    cycle,
    nodeDef: entityDef,
  }).filter(mobileNodeDefFilter({ cycle }));

  if (onlyKeys) {
    return keyDefs;
  }
  const defsIncludedInSummary =
    Surveys.getNodeDefsIncludedInMultipleEntitySummary({
      survey,
      cycle,
      nodeDef: entityDef,
    }).filter(
      (nodeDef) =>
        // key defs can be marked as included in summary too: avoid duplicates
        !keyDefs.includes(nodeDef) && mobileNodeDefFilter({ cycle })(nodeDef),
    );
  const summaryDefs = [...keyDefs, ...defsIncludedInSummary];

  const otherDefsToAddCount = maxSummaryDefs - summaryDefs.length;

  if (otherDefsToAddCount > 0) {
    const entityDefChildrenNotKeys = getChildrenDefs({
      survey,
      nodeDef: entityDef,
      cycle,
    }).filter(
      (childDef) =>
        !NodeDefs.isKey(childDef) &&
        !NodeDefs.isMultiple(childDef) &&
        !NodeDefs.isIncludedInMultipleEntitySummary(cycle)(childDef),
    );
    if (entityDefChildrenNotKeys.length > 0) {
      summaryDefs.push(
        ...entityDefChildrenNotKeys.slice(
          0,
          Math.min(entityDefChildrenNotKeys.length, otherDefsToAddCount),
        ),
      );
    }
  }
  return summaryDefs;
};

const samplingPointDataLocationPropName = "location";

// the sampling point data category, only if its items have a location
const getSamplingPointDataCategoryWithLocation = (survey: ArenaSurvey) => {
  const samplingPointDataCategory = Surveys.getCategoryByName({
    survey,
    categoryName: samplingPointDataCategoryName,
  });
  return samplingPointDataCategory &&
    Categories.getExtraPropDefByName(samplingPointDataLocationPropName)(
      samplingPointDataCategory,
    )
    ? samplingPointDataCategory
    : null;
};

const hasSamplingPointDataLocation = (survey: ArenaSurvey) =>
  !!getSamplingPointDataCategoryWithLocation(survey);

const isCodeAttributeFromSamplingPointData = ({
  survey,
  nodeDef,
}: {
  survey: ArenaSurvey;
  nodeDef: ArenaNodeDefCode;
}) => {
  if (nodeDef.type !== NodeDefType.code) return false;

  const category = Surveys.getCategoryByUuid({
    survey,
    categoryUuid: NodeDefs.getCategoryUuid(nodeDef)!,
  });
  if (!category) return false;

  return samplingPointDataCategoryName === category.props?.name;
};

const getNodeDefsLabelsOrNames = ({
  survey,
  nodeDefUuids,
  lang,
}: {
  survey: ArenaSurvey;
  nodeDefUuids: string[];
  lang: LanguageCode;
}) =>
  nodeDefUuids.map((nodeDefUuid) => {
    const nodeDef = Surveys.getNodeDefByUuid({ survey, uuid: nodeDefUuid });
    return NodeDefs.getLabelOrName(nodeDef, lang);
  });

const findNodeDefUuidsUsingPrevCycleValueFunctions = (
  survey: ArenaSurvey,
): string[] => {
  const nodeeDefsWithPrevCycleValueFunctions = [];
  for (const nodeDef of Object.values(survey.nodeDefs ?? {})) {
    const nodeDefExpressions: ArenaNodeDefExpression[] = [
      ...NodeDefs.getApplicable(nodeDef),
      ...NodeDefs.getDefaultValues(nodeDef),
      ...NodeDefs.getVisibleIf(nodeDef),
      ...NodeDefs.getEditableIf(nodeDef),
      ...NodeDefs.getValidationsExpressions(nodeDef),
    ];
    if (nodeDef.type === NodeDefType.file) {
      const fnExpr = NodeDefs.getFileNameExpression(
        nodeDef as ArenaNodeDefFile,
      );
      if (fnExpr) {
        nodeDefExpressions.push({
          expression: fnExpr,
        } as ArenaNodeDefExpression);
      }
    }
    if (
      nodeDefExpressions.some((nodeDefExpression) =>
        [nodeDefExpression.expression, nodeDefExpression.applyIf].some(
          (expression) =>
            Objects.isNotEmpty(expression) &&
            (expression!.includes("prevCycleValue") ||
              expression!.includes("prevCycleValues")),
        ),
      )
    ) {
      nodeeDefsWithPrevCycleValueFunctions.push(nodeDef.uuid);
    }
  }
  return nodeeDefsWithPrevCycleValueFunctions;
};

// files included in the survey package by Arena only when the preloaded map layers are enabled
const getPreloadedMapLayers = (survey: ArenaSurvey): ArenaSurveyFile[] =>
  survey.props.preloadedMapLayersEnabled
    ? (survey.props.preloadedMapLayers ?? []).filter(
        (file) => !file.props.deleted,
      )
    : [];

export const SurveyDefs = {
  samplingPointDataLocationPropName,
  getSamplingPointDataCategoryWithLocation,
  getRootKeyDefs,
  isRootKeyDef,
  getChildrenDefs,
  getDescendantsInSingleEntities,
  getEntitySummaryDefs,
  hasSamplingPointDataLocation,
  isCodeAttributeFromSamplingPointData,
  getNodeDefsLabelsOrNames,
  findNodeDefUuidsUsingPrevCycleValueFunctions,
  getPreloadedMapLayers,
};
