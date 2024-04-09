import {NodeDefs} from '@openforis/arena-core';
import React, {memo} from 'react';
import {useSelector} from 'react-redux';

import surveySelectors from 'state/survey/selectors';

import CodeCheckbox from './CodeCheckbox';
import CodeDropdown from './CodeDropdown';
import {useCode} from './hooks';
import {selectors as formSelectors} from 'state/form';

const MAX_NUMBER_ITEMS_FOR_CHECKBOX = 15;

const useNumberOfCategoryItems = nodeDef => {
  const {categoryItems} = useCode(nodeDef);
  return categoryItems.length;
};

const useIsKeyAndEnumerate = nodeDef => {
  const key = NodeDefs.isKey(nodeDef);
  const parentEntityNodeDef = useSelector(state =>
    formSelectors.getParentEntityNodeDef(state, nodeDef),
  );
  const enumerate = NodeDefs.isEnumerate(parentEntityNodeDef);
  return key && enumerate;
};

const Preview = ({nodeDef}) => {
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const numberOfCategoryItems = useNumberOfCategoryItems(nodeDef);
  const isKeyAndEnumerate = useIsKeyAndEnumerate(nodeDef);

  if (
    NodeDefs.getLayoutRenderType(cycle)(nodeDef) === 'checkbox' &&
    numberOfCategoryItems < MAX_NUMBER_ITEMS_FOR_CHECKBOX
  ) {
    return <CodeCheckbox nodeDef={nodeDef} disabled={isKeyAndEnumerate} />;
  }

  return <CodeDropdown nodeDef={nodeDef} disabled={isKeyAndEnumerate} />;
};

const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.nodeDef.uuid === nextProps.nodeDef.uuid;
};

export default memo(Preview, arePropsEqual);
