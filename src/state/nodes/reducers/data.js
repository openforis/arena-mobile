import {handleActions} from 'redux-actions';

import initialState from '../initial.state';

const data = handleActions({}, initialState.accessData || {});

export default data;
