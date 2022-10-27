import {NodeDefs} from '@openforis/arena-core';
import {useMemo} from 'react';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';
import surveySelectors from 'state/survey/selectors';

NodeDefs.getLayoutProps =
  (cycle = 0) =>
  nodeDef =>
    nodeDef.props?.layout?.[cycle] || {};

const getCategoryItemLabel =
  (nodeDef, cycle, language) =>
  ({categoryItem}) => {
    const {codeShown: hasToShowCode} = NodeDefs.getLayoutProps(cycle)(nodeDef);
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

  const _categoryItems = useMemo(
    () => (node?.uuid ? nodeCategoryItems : nodeDefCategoryItems),
    [node, nodeCategoryItems, nodeDefCategoryItems],
  );

  return {
    nodes,
    categoryItems: _categoryItems,

    getCategoryItemLabel: getCategoryItemLabel(nodeDef, cycle, language),
  };
};
export default useCode;
