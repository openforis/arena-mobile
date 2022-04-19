import appState from './app/initial.state';
import recordsState from './records/initial.state';
import surveyState from './survey/initial.state';
import surveysState from './surveys/initial.state';
import userState from './user/initial.state';

const globalInitialState = {
  app: appState,

  records: recordsState,
  survey: surveyState,
  surveys: surveysState,
  user: userState,
};

export default globalInitialState;
