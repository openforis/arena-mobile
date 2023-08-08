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
      images: {
        compressQuality: 0.5,
        compressMaxHeight: 1024,
        compressMaxWidth: 1024,
        maxResolution: false,
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
