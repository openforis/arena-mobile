import * as React from 'react';

import {Text} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

import Card from 'arena-mobile-ui/components/Card';
import {useSelector} from 'react-redux';
import {selectors as userSelectors} from 'state/user';
import {useTranslation} from 'react-i18next';

const LoggedInAs = () => {
  const {t} = useTranslation();
  const name = useSelector(userSelectors.getName);
  const email = useSelector(userSelectors.getEmail);

  return (
    <Card>
      <Text>{t('Home:logged_in_as')}</Text>
      <Text style={[baseStyles.textStyle.header]}>
        {name} - {email}
      </Text>
    </Card>
  );
};

export default LoggedInAs;
