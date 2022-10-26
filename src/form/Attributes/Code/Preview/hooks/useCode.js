import {NodeDefs} from '@openforis/arena-core';
import {useMemo} from 'react';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';
import surveySelectors from 'state/survey/selectors';

const getCategoryItemLabel =
  (nodeDef, cycle) =>
  ({categoryItem, language}) => {
    const {codeShown: hasToShowCode} = NodeDefs.getLayoutProps(cycle)(nodeDef);
    const {labels = {}, code} = categoryItem?.props;

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
    language,
    nodes,
    categoryItems: _categoryItems,

    getCategoryItemLabel: getCategoryItemLabel(nodeDef, cycle),
  };
};
export default useCode;
