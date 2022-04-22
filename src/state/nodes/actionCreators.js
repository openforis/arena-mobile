import {createActions} from 'redux-actions';

import types from './actionTypes';

const {nodes} = createActions({
  [types.createNode$]: ({nodeDef}) => ({nodeDef}),
  [types.updateNode$]: ({updatedNode}) => ({updatedNode}),
  [types.SET_NODE]: ({node}) => ({node}),
  [types.SET_NODES]: ({nodes: _nodes = []}) => ({nodes: _nodes}),
  [types.DELETE_NODE]: ({node}) => ({node}),
  [types.CLEAN]: () => ({}),
});

export default nodes;
