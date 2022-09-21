import i18n from 'i18n';

export const checkIfCurrentServerIsTheSurveysServer = ({survey, serverUrl}) => {
  if (survey?.serverUrl && survey?.serverUrl !== serverUrl) {
    throw new Error(
      i18n.t('Surveys:toasts.server', {
        surveyServer: survey?.serverUrl,
        serverUrl,
      }),
    );
  }
};
