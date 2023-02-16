import React from 'react';
import {useTranslation} from 'react-i18next';

import Empty from 'arena-mobile-ui/components/Empty';
import {useNavigateTo} from 'navigation/hooks';
const ErrorSurveysList = () => {
  const {t} = useTranslation();
  const {navigateTo, routes} = useNavigateTo();

  return (
    <Empty
      title={t('Surveys:remote.error.title')}
      info={t('Surveys:remote.error.info')}
      ctaLabel={t('Surveys:remote.error.cta_label')}
      onPress={navigateTo({route: routes.CONNECTION_SETTINGS})}
    />
  );
};

export default ErrorSurveysList;
