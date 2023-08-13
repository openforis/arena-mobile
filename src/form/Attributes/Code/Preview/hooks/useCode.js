import {NodeDefs, CategoryItems} from '@openforis/arena-core';
import {useCallback, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';
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

const useCode = ({nodeDef, node}) => {
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const cycle = useSelector(surveySelectors.getSurveyCycle);

  const nodeCategoryItems = useSelector(state =>
    surveySelectors.getNodeCategoryItems(state, nodeDef.uuid, node),
  );
  const nodeDefCategoryItems = useSelector(state =>
    surveySelectors.getCategoryItems(state, nodeDef.uuid),
  );

  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  const _categoryItems = useMemo(() => {
    const items = node?.uuid ? nodeCategoryItems : nodeDefCategoryItems;
    return items.sort((a, b) => a.props.index - b.props.index);
  }, [node, nodeCategoryItems, nodeDefCategoryItems]);

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
