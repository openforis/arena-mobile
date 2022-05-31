import {handleActions} from 'redux-actions';

import globalActions from 'state/globalActions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const data = handleActions(
  {
    [actions.setRecord]: (state, {payload: {record}}) => ({
      ...state,
      record: record.uuid,
    }),
    [actions.setNode]: (state, {payload: {node = false}}) => ({
      ...state,
      node: node.uuid || null,
      parentEntityNode: node.parentUuid || state.parentEntityNode,
      nodeDef: node.nodeDefUuid || null,
    }),
    [actions.setParentEntityNode]: (state, {payload: {node = false}}) => ({
      ...state,
      parentEntityNode: node.uuid || state.parentEntityNode,
      parentEntityNodeDef: node.nodeDefUuid || state.parentEntityNodeDef,
    }),
    [actions.clean]: () => initialState.data,
    [globalActions.reset]: () => initialState.data || {},
  },
  initialState.data || {},
);

export default data;
