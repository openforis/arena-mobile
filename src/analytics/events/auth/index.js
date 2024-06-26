import defaultEvent from '../defaultEvent';

export default {
  start: defaultEvent({
    type: 'Authenticate User Started',
  }),
  success: defaultEvent({
    type: 'Authenticate User Success',
  }),
  error: defaultEvent({
    type: 'Authenticate User Error',
  }),
};
