import * as React from 'react';

import {Text} from 'react-native';

import Card from 'arena-mobile-ui/components/Card';

import {useTranslation} from 'react-i18next';

const NotLoggedIn = () => {
  const {t} = useTranslation();

  return (
    <Card>
      <Text>{t('Home:not_logged_in_as')}</Text>
    </Card>
  );
};

export default NotLoggedIn;
