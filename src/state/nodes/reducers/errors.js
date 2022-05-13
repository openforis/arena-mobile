import {Objects} from '@openforis/arena-core';
import {handleActions} from 'redux-actions';

import {deleteValueByKey} from 'infra/objectUtils';

import actions from '../actionCreators';
import initialState from '../initial.state';

const errors = handleActions(
  {
    [actions.setErrors]: (state, {payload: {errors: _errors}}) =>
      deleteValueByKey({
        conditionToDelete: item => !item || Objects.isEmpty(item),
      })({
        ...state,
        ..._errors,
      }),
  },
  initialState.errors || {},
);

export default errors;
