import {dataKeys} from './constants';

const initialState = {
  accessData: {
    [dataKeys.username]: '',
    [dataKeys.password]: '',
  },
  preferences: {
    settings: {
      survey: {
        taxonomies: {
          defaultVisibleFields: null,
        },
      },
    },
  },
  ui: {
    serverError: false,
    credentialsError: false,
    isLoading: false,
    showNames: false,
    devMode: false,
    style: {
      baseModifier: 1,
      fontBaseModifier: 1,
      colorScheme: 'light',
    },
  },
};

export default initialState;
