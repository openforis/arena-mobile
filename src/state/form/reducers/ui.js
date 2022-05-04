import {handleActions} from 'redux-actions';

import initialState from '../initial.state';

const ui = handleActions({}, initialState.ui || {});

export default ui;
