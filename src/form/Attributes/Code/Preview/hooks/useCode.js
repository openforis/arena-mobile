import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';
import surveySelectors from 'state/survey/selectors';

const getCategoryItemLabel =
  nodeDef =>
  ({categoryItem, language}) =>
    categoryItem?.props?.code
      ? `(${categoryItem?.props?.code}) ${
          categoryItem?.props?.labels?.[language] || ''
        }`
      : '-';

const useCode = ({nodeDef, node}) => {
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);

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

    getCategoryItemLabel: getCategoryItemLabel(nodeDef),
  };
};
export default useCode;
