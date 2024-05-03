import {createActions} from 'redux-actions';

import types from './actionTypes';

const {nodes} = createActions({
  [types.createNode$]: ({nodeDef, parentNode, selectNode}) => ({
    nodeDef,
    parentNode,
    selectNode,
  }),
  [types.removeNode$]: ({node}) => ({node}),
  [types.updateNode$]: ({updatedNode, callback, shouldJump = true}) => ({
    updatedNode,
    callback,
    shouldJump,
  }),
  [types.createNodeWithValue$]: ({nodeDef, parentNode, value, callback}) => ({
    nodeDef,
    parentNode,
    value,
    callback,
  }),

  [types.SET_NODES]: ({nodes: _nodes = []}) => ({nodes: _nodes}),
  [types.DELETE_NODE]: ({node}) => ({node}),
  [types.DELETE_NODES]: ({nodes: _nodes}) => ({nodes: _nodes}),
  [types.CLEAN]: () => ({}),
});

export default nodes;
