import {createActions} from 'redux-actions';

import types from './actionTypes';

const {nodes} = createActions({
  [types.createNode$]: ({nodeDef}) => ({nodeDef}),
  [types.updateNode$]: ({value}) => ({value}),
  [types.ADD_NODE]: ({node}) => ({node}),
  [types.ADD_NODES]: ({nodes: _nodes}) => ({nodes: _nodes}),
  [types.SET_NODE]: ({node}) => ({node}),
  [types.DELETE_NODE]: ({node}) => ({node}),
  [types.CLEAN]: () => ({}),
});

export default nodes;
