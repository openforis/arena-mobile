import appState from './app/initial.state';
import formState from './form/initial.state';
import nodesState from './nodes/initial.state';
import recordsState from './records/initial.state';
import surveyState from './survey/initial.state';
import surveysState from './surveys/initial.state';
import userState from './user/initial.state';

const globalInitialState = {
  app: appState,
  nodes: nodesState,
  records: recordsState,
  survey: surveyState,
  surveys: surveysState,
  user: userState,
  form: formState,
};

export default globalInitialState;
