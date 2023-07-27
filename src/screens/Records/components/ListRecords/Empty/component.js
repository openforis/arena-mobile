import React from 'react';
import {useTranslation} from 'react-i18next';

import Empty from 'arena-mobile-ui/components/Empty';

const EmptyRecordsList = ({onPress}) => {
  const {t} = useTranslation();

  return (
    <Empty
      title={t('Records:empty.title')}
      info={t('Records:empty.info')}
      ctaLabel={t('Records:empty.cta_label')}
      onPress={onPress}
    />
  );
};

export default EmptyRecordsList;
