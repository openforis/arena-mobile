import {NodeDefs, RecordExpressionEvaluator} from '@openforis/arena-core';
import {useCallback, useMemo, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';
import {selectors as nodesSelectors} from 'state/nodes';
import surveySelectors from 'state/survey/selectors';

const getCategoryItemLabel = (nodeDef, cycle, language) => categoryItem => {
  const {codeShown: hasToShowCode = true} =
    NodeDefs.getLayoutProps(cycle)(nodeDef);

  const {labels = {}, code} = categoryItem?.props || {};
  const codeString = hasToShowCode ? `(${code})` : '';
  const labelString = labels?.[language] || code || '';
  return categoryItem?.props?.code ? `${codeString} ${labelString}` : '-';
};

const getCategoryItemDescription = language => categoryItem => {
  const {descriptions = {}} = categoryItem?.props || {};
  return descriptions?.[language] || '';
};

export const useCodeWithNode = (nodeDef, node) => {
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const survey = useSelector(surveySelectors.getSurvey);
  const record = useSelector(formSelectors.getFullRecord);

  const nodeCategoryItems = useSelector(state =>
    surveySelectors.getNodeCategoryItems(state, nodeDef.uuid, node),
  );
  const nodeDefCategoryItems = useSelector(state =>
    surveySelectors.getCategoryItems(state, nodeDef.uuid),
  );

  const parentNode = useSelector(state =>
    nodesSelectors.getNodeByUuid(state, node?.parentUuid),
  );

  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  const _categoryItems = useMemo(() => {
    const itemsFilter = nodeDef?.propsAdvanced?.itemsFilter || false;
    const expressionEvaluator = new RecordExpressionEvaluator();
    const items = node?.uuid ? nodeCategoryItems : nodeDefCategoryItems;
    if (!itemsFilter) {
      return items.sort((a, b) => a.props.index - b.props.index);
    }

    return items
      .filter(item => {
        try {
          return expressionEvaluator.evalExpression({
            survey,
            record,
            node: parentNode,
            query: itemsFilter,
            item,
          });
        } catch (error) {
          // Allow to pass items
          return true;
        }
      })
      .sort((a, b) => a.props.index - b.props.index);
  }, [
    nodeDef,
    node,
    nodeCategoryItems,
    nodeDefCategoryItems,
    survey,
    record,
    parentNode,
  ]);

  const _getCategoryItemLabel = useCallback(
    item => getCategoryItemLabel(nodeDef, cycle, language)(item),
    [nodeDef, cycle, language],
  );

  const _getCategoryItemDescription = useCallback(
    item => getCategoryItemDescription(language)(item),
    [language],
  );

  const categoryItemsByUuid = useMemo(() => {
    const items = _categoryItems.reduce((acc, item) => {
      acc[item.uuid] = item;
      return acc;
    }, {});
    return items;
  }, [_categoryItems]);

  return {
    nodes,
    categoryItems: _categoryItems,
    categoryItemsByUuid,
    getCategoryItemLabel: _getCategoryItemLabel,
    getCategoryItemDescription: _getCategoryItemDescription,
  };
};

const useCode = nodeDef => {
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const cycle = useSelector(surveySelectors.getSurveyCycle);

  const nodeDefCategoryItems = useSelector(state =>
    surveySelectors.getCategoryItems(state, nodeDef.uuid),
  );

  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  const _categoryItems = useMemo(() => {
    const itemsFilter = nodeDef?.propsAdvanced?.itemsFilter || false;

    if (!itemsFilter) {
      return nodeDefCategoryItems.sort((a, b) => a.props.index - b.props.index);
    }

    return items.sort((a, b) => a.props.index - b.props.index);
  }, [nodeDef, nodeDefCategoryItems]);

  const _getCategoryItemLabel = useCallback(
    item => getCategoryItemLabel(nodeDef, cycle, language)(item),
    [nodeDef, cycle, language],
  );

  const _getCategoryItemDescription = useCallback(
    item => getCategoryItemDescription(language)(item),
    [language],
  );

  const categoryItemsByUuid = useMemo(() => {
    const items = _categoryItems.reduce((acc, item) => {
      acc[item.uuid] = item;
      return acc;
    }, {});
    return items;
  }, [_categoryItems]);

  return {
    nodes,
    categoryItems: _categoryItems,
    categoryItemsByUuid,
    getCategoryItemLabel: _getCategoryItemLabel,
    getCategoryItemDescription: _getCategoryItemDescription,
  };
};
export default useCode;
