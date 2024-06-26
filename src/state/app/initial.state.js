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
          showOneOptionPerVernacularName: false,
        },
      },
      images: {
        compressQuality: 0.5,
        compressMaxHeight: 1024,
        compressMaxWidth: 1024,
        isMaxResolution: false,
      },
      geo: {
        hasToUseMapsMeAsDefault: true,
      },
    },
    serverUrl: null,
  },
  diagnosis: {
    shareDataLog: false,
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
    applicationLanguage: 'en',
  },
};

export default initialState;
