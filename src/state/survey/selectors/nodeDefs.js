import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import {getSurvey} from './base';

const _getCachedKeyObjectUuid = (_, object) => object?.uuid || '_';

// --- NodeDefs
export const getNodeDefsByUuid = createSelector(
  getSurvey,
  survey => survey.nodeDefs,
);

export const getNodeDefByUuid = createCachedSelector(
  getNodeDefsByUuid,
  (_, nodeDefUuid) => nodeDefUuid,
  (nodeDefsByUuid, nodeDefUuid) => nodeDefsByUuid[nodeDefUuid] || false,
)((_state_, nodeDefUuid) => nodeDefUuid || '_');

export const getNodeDefs = createSelector(getNodeDefsByUuid, nodeDefs =>
  Object.values(nodeDefs),
);
export const getNodeDefRoot = createSelector(getNodeDefs, nodeDefs =>
  nodeDefs.find(({parentUuid}) => !parentUuid),
);

export const getNodeDefChildren = createCachedSelector(
  getNodeDefs,
  (_, parentNodeDef) => parentNodeDef,
  (nodeDefs, parentNodeDef) =>
    nodeDefs.filter(
      ({parentUuid}) => !!parentUuid && parentUuid === parentNodeDef?.uuid,
    ),
)(_getCachedKeyObjectUuid);

export const getNodeDefEntityChildrenKeys = createCachedSelector(
  getNodeDefChildren,
  childrenNodeDefs => childrenNodeDefs.filter(_nodeDef => _nodeDef.props.key),
)(_getCachedKeyObjectUuid);

export const getNodeDefChildrenEntities = createCachedSelector(
  getNodeDefChildren,
  nodeDefs => nodeDefs.filter(({type}) => type === 'entity'),
)(_getCachedKeyObjectUuid);

export const getNodeDefEntityChildrenAttributes = createCachedSelector(
  getNodeDefChildren,
  nodeDefs => nodeDefs.filter(({type}) => type !== 'entity'),
)(_getCachedKeyObjectUuid);

export const getNodeDefEntityChildrenAttributesUuids = createCachedSelector(
  getNodeDefEntityChildrenAttributes,
  nodeDefs => nodeDefs.map(({uuid}) => uuid),
)(_getCachedKeyObjectUuid);

export const getNodeDefChildrenSingleEntities = createCachedSelector(
  getNodeDefChildren,
  nodeDefs =>
    nodeDefs.filter(
      ({type, props}) => type === 'entity' && props?.multiple !== true,
    ),
)(_getCachedKeyObjectUuid);
