import * as React from 'react';
import {useTranslation} from 'react-i18next';

import EmptyBlock from 'arena-mobile-ui/components/EmptyBlock';
import {useNavigateTo} from 'navigation/hooks';

const NotLoggedIn = () => {
  const {t} = useTranslation();
  const {navigateTo, routes} = useNavigateTo();

  return (
    <EmptyBlock
      title={t('Home:not_logged_in.title')}
      info={t('Home:not_logged_in.info')}
      ctaLabel={t('Home:not_logged_in.cta')}
      onPress={navigateTo({route: routes.CONNECTION_SETTINGS})}
      buttonType="primary"
      buttonWidth="full"
    />
  );
};

export default NotLoggedIn;
