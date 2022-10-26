import {NodeDefs} from '@openforis/arena-core';
import {useMemo, useCallback} from 'react';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

NodeDefs.getLayoutProps =
  (cycle = 0) =>
  nodeDef =>
    nodeDef.props?.layout?.[cycle];

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

  const nodeDefs = useMemo(
    () => nodeDefUuidsInEntity.map(nodeDefUuid => nodeDefsByUuid[nodeDefUuid]),
    [nodeDefUuidsInEntity, nodeDefsByUuid],
  );

  const getWidth = useCallback(
    item =>
      Number(
        (item.layout
          ? NodeDefs.getLayoutProps(cycle)(item)?.columnWidth
          : '150'
        ).replace(/\D+/g, ''),
      ),
    [cycle],
  );

  return {headers: nodeDefs, rows: nodes, getWidth};
};
