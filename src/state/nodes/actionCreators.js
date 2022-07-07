import {createActions} from 'redux-actions';

import types from './actionTypes';

const {nodes} = createActions({
  [types.createNode$]: ({nodeDef, parentNode}) => ({nodeDef, parentNode}),
  [types.updateNode$]: ({updatedNode, callback}) => ({
    updatedNode,
    callback,
  }),
  [types.SET_NODE]: ({node}) => ({node}),
  [types.SET_NODES]: ({nodes: _nodes = []}) => ({nodes: _nodes}),
  [types.DELETE_NODE]: ({node}) => ({node}),
  [types.DELETE_NODES]: ({nodes: _nodes}) => ({nodes: _nodes}),
  [types.CLEAN]: () => ({}),
});

export default nodes;
