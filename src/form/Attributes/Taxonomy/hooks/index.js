import {NodeDefs} from '@openforis/arena-core';
import {useCallback} from 'react';
import {useSelector} from 'react-redux';

import {getTaxonItemLabel} from 'arena/taxonomy';
import {selectors as appSelectors} from 'state/app';
import {selectors as surveySelectors} from 'state/survey';

export const useTaxonItemLabelExtractor = nodeDef => {
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const defaultVisibleFields = useSelector(
    appSelectors.getSettingsPreferencesSurveyTaxonomiesDefaultVisibleFields,
  );

  const _labelStractor = useCallback(
    item => {
      console.log(
        NodeDefs?.getVisibleFields?.(nodeDef) || defaultVisibleFields,
      );
      return getTaxonItemLabel({
        item,
        language,
        taxonomyVisibleFields:
          NodeDefs?.getVisibleFields?.(nodeDef) || defaultVisibleFields,
      });
    },
    [language, defaultVisibleFields, nodeDef],
  );

  return _labelStractor;
};
