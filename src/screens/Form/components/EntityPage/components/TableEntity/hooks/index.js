import {NodeDefs} from '@openforis/arena-core';
import {useMemo, useCallback} from 'react';
import {useSelector} from 'react-redux';

import {selectors as appSelectors} from 'state/app';
import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

export const useEntityTableData = () => {
  const nodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  const cycle = useSelector(surveySelectors.getSurveyCycle);

  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );
  const nodeDefUuidsInEntity = useSelector(state =>
    surveySelectors.getNodeDefEntityChildrenAttributesUuids(state, nodeDef),
  );
  const nodeDefsByUuid = useSelector(surveySelectors.getNodeDefsByUuid);

  const baseModifier = useSelector(appSelectors.getBaseModifier);
  const fontBaseModifier = useSelector(appSelectors.getFontBaseModifier);

  const nodeDefs = useMemo(
    () => nodeDefUuidsInEntity.map(nodeDefUuid => nodeDefsByUuid[nodeDefUuid]),
    [nodeDefUuidsInEntity, nodeDefsByUuid],
  );

  const getWidth = useCallback(
    item => {
      if (item?.props?.layout) {
        return (
          Number(
            (
              NodeDefs.getLayoutProps(cycle)(item)?.columnWidth || '150'
            ).replace(/\D+/g, ''),
          ) *
          1.25 *
          Math.max(baseModifier, 1) *
          Math.max(fontBaseModifier, 1)
        );
      }
      return 150;
    },
    [cycle, baseModifier, fontBaseModifier],
  );

  return {headers: nodeDefs, rows: nodes, getWidth};
};
