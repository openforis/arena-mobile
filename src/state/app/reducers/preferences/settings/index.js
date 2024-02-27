import {combineReducers} from 'redux';

import images from './images';
import survey from './survey';
import geo from './geo';

export default combineReducers({
  images,
  survey,
  geo,
});
