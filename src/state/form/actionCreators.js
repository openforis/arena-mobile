import {createActions} from 'redux-actions';

import types from './actionTypes';

const {form} = createActions({
  [types.SET_EDIT]: ({edit}) => ({edit}),
  [types.SET_NODE]: ({node}) => ({node}),
  [types.SET_NODE_DEF]: ({nodeDef}) => ({nodeDef}),
  [types.SET_RECORD]: ({record}) => ({record}),
  [types.SET_NODE_DEF_WITH_NODE]: ({nodeDef, node}) => ({
    nodeDef,
    node,
  }),
  [types.initializeRecord$]: () => ({}),
  [types.createEntity$]: ({nodeDef = false, node = false} = {}) => ({
    nodeDef,
    node,
  }),
  [types.selectEntity$]: ({nodeDef = false} = {}) => ({nodeDef}),
  [types.selectEntityNode$]: ({node = false}) => ({node}),

  [types.loadNodeDef$]: () => ({}),
  [types.deleteNodeEntity$]: ({node}) => ({node}),
  [types.CLEAN]: () => ({}),
  [types.TOGGLE_ENTITY_SELECTOR]: () => ({}),
  [types.CLOSE_ENTITY_SELECTOR]: () => ({}),
});

export default form;
