import React from 'react';
import {useTranslation} from 'react-i18next';

import Empty from 'arena-mobile-ui/components/Empty';

const EmptyRemote = ({onPress}) => {
  const {t} = useTranslation();

  return (
    <Empty
      title={t('Surveys:remote.empty.title')}
      info={t('Surveys:remote.empty.info')}
      ctaLabel={t('Surveys:remote.empty.cta_label')}
      onPress={onPress}
    />
  );
};

export default EmptyRemote;
