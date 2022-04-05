import * as React from 'react';
import {useTranslation} from 'react-i18next';

import EmptyBlock from 'arena-mobile-ui/components/EmptyBlock';
import {useNavigateTo} from 'navigation/hooks';

const NoLocalSurveys = () => {
  const {t} = useTranslation();
  const {navigateTo, routes} = useNavigateTo();

  return (
    <EmptyBlock
      title={t('Home:survey.no_surveys.title')}
      info={t('Home:survey.no_surveys.info')}
      ctaLabel={t('Home:survey.no_surveys.cta')}
      onPress={navigateTo({route: routes.SURVEYS})}
    />
  );
};

export default NoLocalSurveys;
