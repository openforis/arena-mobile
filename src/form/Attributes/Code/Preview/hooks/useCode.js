import {NodeDefs} from '@openforis/arena-core';
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
  return {
    nodes,
    categoryItems: _categoryItems,
    getCategoryItemLabel: _getCategoryItemLabel,
  };
};
export default useCode;
