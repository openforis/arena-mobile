import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native';
import {useSelector} from 'react-redux';

import Card from 'arena-mobile-ui/components/Card';
import baseStyles from 'arena-mobile-ui/styles';
import {selectors as userSelectors} from 'state/user';

const LoggedInAs = () => {
  const {t} = useTranslation();

  const name = useSelector(userSelectors.getName);
  const email = useSelector(userSelectors.getEmail);

  return (
    <Card>
      <Text style={[baseStyles.textStyle.secondaryText]}>
        {t('Home:logged_in_as')}
      </Text>
      <Text style={[baseStyles.textStyle.header]}>
        {name} - <Text style={[baseStyles.textStyle.lower]}>{email}</Text>
      </Text>
    </Card>
  );
};

export default LoggedInAs;
