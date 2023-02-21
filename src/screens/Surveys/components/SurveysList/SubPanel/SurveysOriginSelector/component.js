import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import Button from 'arena-mobile-ui/components/Button';

import styles from './styles';

const SurveysOriginSelector = ({surveysOrigin, setSurveysOrigin}) => {
  const {t} = useTranslation();

  const buttonConfig = useMemo(() => {
    if (surveysOrigin === 'local') {
      return {
        label: t('Surveys:subpanel.surveys_origin_selector.local.label'),
        onPress: () => setSurveysOrigin('remote'),
      };
    } else {
      return {
        label: t('Surveys:subpanel.surveys_origin_selector.remote.label'),
        onPress: () => setSurveysOrigin('local'),
      };
    }
  }, [surveysOrigin, setSurveysOrigin, t]);

  return (
    <Button
      label={buttonConfig.label}
      onPress={buttonConfig.onPress}
      type="ghost"
      customContainerStyle={styles.button}
      allowMultipleLines={true}
    />
  );
};

export default SurveysOriginSelector;
