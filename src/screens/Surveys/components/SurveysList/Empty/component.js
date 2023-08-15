import React from 'react';
import {useTranslation} from 'react-i18next';

import Empty from 'arena-mobile-ui/components/Empty';

const EmptySuveysList = ({onPress, surveysOrigin, hasSurveys}) => {
  const {t} = useTranslation();

  if (hasSurveys) {
    return (
      <Empty
        title={t('Surveys:empty_with_surveys.title')}
        info={t('Surveys:empty_with_surveys.info')}
      />
    );
  }

  return (
    <Empty
      title={t(`Surveys:${surveysOrigin}.empty.title`)}
      info={t(`Surveys:${surveysOrigin}.empty.info`)}
      ctaLabel={t(`Surveys:${surveysOrigin}.empty.cta_label`)}
      onPress={onPress}
    />
  );
};

export default EmptySuveysList;
