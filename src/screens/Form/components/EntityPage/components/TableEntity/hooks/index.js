import {NodeDefs, NodeDefType} from '@openforis/arena-core';
import {useCallback} from 'react';
import {useSelector} from 'react-redux';

import {selectors as appSelectors} from 'state/app';
import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

export const useEntityTableData = () => {
  const baseModifier = useSelector(appSelectors.getBaseModifier);
  const fontBaseModifier = useSelector(appSelectors.getFontBaseModifier);

  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  const cycle = useSelector(surveySelectors.getSurveyCycle);

  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, parentEntityNodeDef),
  );

  const formNodeDefs = useSelector(formSelectors.getFormAttributesNodeDefs);

  const getWidth = useCallback(
    item => {
      let width =
        150 * Math.max(baseModifier, 1) * Math.max(fontBaseModifier, 1);
      if (item?.props?.layout) {
        width =
          Number(
            (
              NodeDefs.getLayoutProps(cycle)(item)?.columnWidth || '150'
            ).replace(/\D+/g, ''),
          ) * 1.25;
      }
      if (NodeDefs.getType(item) === NodeDefType.taxon) {
        width = width * 2;
      }

      return width;
    },
    [cycle, baseModifier, fontBaseModifier],
  );

  return {headers: formNodeDefs, rows: nodes, getWidth};
};
