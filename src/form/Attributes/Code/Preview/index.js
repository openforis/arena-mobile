import {NodeDefs} from '@openforis/arena-core';
import React, {memo} from 'react';
import {useSelector} from 'react-redux';

import surveySelectors from 'state/survey/selectors';

import CodeCheckbox from './CodeCheckbox';
import CodeDropdown from './CodeDropdown';
import {useCode} from './hooks';

const MAX_NUMBER_ITEMS_FOR_CHECKBOX = 15;

const useNumberOfCategoryItems = nodeDef => {
  const {categoryItems} = useCode(nodeDef);
  return categoryItems.length;
};
const Preview = ({nodeDef}) => {
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const numberOfCategoryItems = useNumberOfCategoryItems(nodeDef);

  if (
    NodeDefs.getLayoutRenderType(cycle)(nodeDef) === 'checkbox' &&
    numberOfCategoryItems < MAX_NUMBER_ITEMS_FOR_CHECKBOX
  ) {
    return <CodeCheckbox nodeDef={nodeDef} />;
  }

  return <CodeDropdown nodeDef={nodeDef} />;
};

const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.nodeDef.uuid === nextProps.nodeDef.uuid;
};

export default memo(Preview, arePropsEqual);
