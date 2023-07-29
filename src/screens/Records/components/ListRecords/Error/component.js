import React from 'react';
import {useTranslation} from 'react-i18next';

import Empty from 'arena-mobile-ui/components/Empty';

const ErrorList = () => {
  const {t} = useTranslation();

  return (
    <Empty
      title={t('Records:error.title')}
      info={t('Records:error.info')}
      ctaLabel={t('Records:error.cta_label')}
    />
  );
};

export default ErrorList;
