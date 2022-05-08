import {handleActions} from 'redux-actions';

import {isEmpty} from 'arena/utils';
import {deleteValueByKey} from 'infra/objectUtils';

import actions from '../actionCreators';
import initialState from '../initial.state';

const errors = handleActions(
  {
    [actions.setErrors]: (state, {payload: {errors: _errors}}) =>
      deleteValueByKey({
        conditionToDelete: item => !item || isEmpty(item),
      })({
        ...state,
        ..._errors,
      }),
  },
  initialState.errors || {},
);

export default errors;
