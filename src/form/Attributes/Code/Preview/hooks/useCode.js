import {NodeDefs} from '@openforis/arena-core';
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

  const categoryItems = useSelector(state =>
    node?.uuid
      ? surveySelectors.getNodeCategoryItems(state, nodeDef.uuid, node)
      : surveySelectors.getCategoryItems(state, nodeDef.uuid),
  );

  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  return {
    language,
    nodes,
    categoryItems,

    getCategoryItemLabel: getCategoryItemLabel(nodeDef, cycle),
  };
};
export default useCode;
