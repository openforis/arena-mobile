import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import {defaultCycle} from 'arena/config';

import {getSurvey, getSurveyCycle} from './base';

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
  Object.values(nodeDefs).filter(nodeDef => nodeDef.draft !== true),
);
export const getNodeDefRoot = createSelector(getNodeDefs, nodeDefs =>
  nodeDefs.find(({parentUuid}) => !parentUuid),
);

export const getEntitiesNodeDefs = createSelector(getNodeDefs, nodeDefs =>
  nodeDefs.filter(nodeDef => nodeDef.type === 'entity'),
);
export const getEntitiesNodeDefsUuids = createSelector(
  getEntitiesNodeDefs,
  (nodeDefEntities = []) => nodeDefEntities.map(entity => entity.uuid),
);

export const getNodeDefChildren = createCachedSelector(
  getNodeDefs,
  getSurveyCycle,
  (_, parentNodeDef) => parentNodeDef,
  (nodeDefs, cycle, parentNodeDef) =>
    nodeDefs.filter(nodeDef => {
      const {parentUuid, props, analysis} = nodeDef;
      const {cycles = [defaultCycle]} = props;

      return (
        !!parentUuid &&
        parentUuid === parentNodeDef?.uuid &&
        cycles.includes(cycle) &&
        !analysis
      );
    }),
)(_getCachedKeyObjectUuid);

export const getNodeDefEntityChildrenKeys = createCachedSelector(
  getNodeDefChildren,
  childrenNodeDefs => childrenNodeDefs.filter(_nodeDef => _nodeDef.props.key),
)(_getCachedKeyObjectUuid);

export const getNodeDefEntityChildrenAttributesUuids = createCachedSelector(
  getNodeDefChildren,
  nodeDefs => {
    const attributes = [];
    nodeDefs.forEach(nodeDef => {
      // touch here if we like to show tables on the form
      if (nodeDef.type !== 'entity') {
        attributes.push(nodeDef.uuid);
      }
      return;
    });
    return attributes;
  },
)(_getCachedKeyObjectUuid);

export const getNodeDefTableChildren = createCachedSelector(
  getNodeDefChildren,
  getSurveyCycle,
  (nodeDefs, cycle) =>
    nodeDefs.filter(
      ({type, props}) =>
        type === 'entity' && props?.layout?.[cycle]?.renderType === 'table',
    ),
)(_getCachedKeyObjectUuid);

export const getNodeDefTableChildrenUuid = createCachedSelector(
  getNodeDefTableChildren,
  (children = []) => children.map(({uuid}) => uuid),
)(_getCachedKeyObjectUuid);
