import globalInitialState from 'state/initial.state';

import mockSurvey from '../mocks/survey';
import mockUser from '../mocks/user';

const initialState = {
  ...globalInitialState,
  surveys: {
    ...globalInitialState.surveys,
    data: {
      [mockSurvey.uuid]: {...mockSurvey},
    },
  },
  survey: {
    ...globalInitialState.survey,
    data: {
      ...mockSurvey,
    },
  },
  user: {
    ...mockUser,
  },
  form: {
    ...globalInitialState.form,
  },
};

export default initialState;
