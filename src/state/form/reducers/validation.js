import {handleActions} from 'redux-actions';

import globalActions from 'state/globalActions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const validation = handleActions(
  {
    [actions.setValidation]: (_state, {payload: {validation: _validation}}) =>
      _validation,
    [globalActions.reset]: () => initialState.validation || {},
  },
  initialState.validation || {},
);

export default validation;
