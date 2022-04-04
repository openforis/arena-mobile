import React from 'react';
import {useTranslation} from 'react-i18next';

import Empty from 'arena-mobile-ui/components/Empty';

const EmptyLocal = ({onPress}) => {
  const {t} = useTranslation();

  return (
    <Empty
      title={t('Surveys:local.empty.title')}
      info={t('Surveys:local.empty.info')}
      ctaLabel={t('Surveys:local.empty.cta_label')}
      onPress={onPress}
    />
  );
};

export default EmptyLocal;
