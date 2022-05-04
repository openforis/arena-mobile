import {handleActions} from 'redux-actions';

import initialState from '../initial.state';

const data = handleActions({}, initialState.data || {});

export default data;
