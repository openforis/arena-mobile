import {handleActions} from 'redux-actions';

import globalActions from 'state/globalActions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const data = handleActions(
  {
    [actions.setNode]: (state, {payload: {node = false}}) => ({
      ...state,
      node: node.uuid || false,
      parentNode: node.parentUuid || state.parentNode,
    }),
    [actions.setNodeDef]: (state, {payload: {nodeDef = nodeDef}}) => ({
      ...state,
      nodeDef: nodeDef.uuid,
    }),
    [actions.setRecord]: (state, {payload: {record}}) => ({
      ...state,
      record: record.uuid,
    }),

    [actions.setNodeDefWithNode]: (state, {payload: {nodeDef, node}}) => ({
      ...state,
      node: node.uuid,
      nodeDef: nodeDef.uuid,
    }),
    [actions.setEdit]: (state, {payload: {edit}}) => ({...state, edit}),
    [actions.clean]: () => initialState.data,
    [globalActions.reset]: () => initialState.data || {},
  },
  initialState.data || {},
);

export default data;
