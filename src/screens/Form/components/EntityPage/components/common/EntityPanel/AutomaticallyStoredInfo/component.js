import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native';

import styles from './styles';

const AutomaticallyStoredInfo = () => {
  const {t} = useTranslation();

  return (
    <Text style={styles.container}>
      {t('Form:navigation_panel.automatically_stored_info')}
    </Text>
  );
};

export default AutomaticallyStoredInfo;
