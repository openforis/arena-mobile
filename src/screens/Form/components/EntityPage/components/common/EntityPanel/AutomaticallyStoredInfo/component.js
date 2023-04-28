import React from 'react';
import {useTranslation} from 'react-i18next';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import styles from './styles';

const AutomaticallyStoredInfo = () => {
  const {t} = useTranslation();

  return (
    <TextBase type="secondaryText" size="s" customStyle={styles.text}>
      {t('Form:navigation_panel.automatically_stored_info')}
    </TextBase>
  );
};

export default AutomaticallyStoredInfo;
