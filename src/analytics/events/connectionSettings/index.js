import defaultEvent from '../defaultEvent';

export default {
  view: defaultEvent({
    type: 'Connection Setting Opened',
  }),
  start: defaultEvent({
    type: 'Connection Setting Started',
  }),
};
