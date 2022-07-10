import {useMemo} from 'react';
import {useSelector} from 'react-redux';

import {selectors as appSelectors} from 'state/app';
import {selectors as surveySelectors} from 'state/survey';

const useNodeDefNameOrLabel = ({nodeDef}) => {
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const showNames = useSelector(appSelectors.getShowNames);

  const nodeDefName = useMemo(() => {
    if (nodeDef.uuid) {
      return showNames
        ? nodeDef.props.name
        : nodeDef.props?.labels?.[language] || nodeDef.props.name;
    }
    return '';
  }, [showNames, nodeDef, language]);

  return nodeDefName;
};

export default useNodeDefNameOrLabel;
