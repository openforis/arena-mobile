import * as React from 'react';
import {useTranslation} from 'react-i18next';

import EmptyBlock from 'arena-mobile-ui/components/EmptyBlock';
import {ROUTES} from 'navigation/constants';
import {useNavigateTo} from 'navigation/hooks';

const NotLoggedIn = () => {
  const {t} = useTranslation();
  const navigateToConnectionSettings =
    useNavigateTo[ROUTES.CONNECTION_SETTINGS]();

  return (
    <EmptyBlock
      title={t('Home:not_logged_in.title')}
      info={t('Home:not_logged_in.info')}
      label={t('Home:not_logged_in.cta')}
      onPress={navigateToConnectionSettings}
    />
  );
};

export default NotLoggedIn;
