import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import Button from 'arena-mobile-ui/components/Button';

import styles from './styles';

const SurveysOriginSelector = ({surveysOrigin, setSurveysOrigin}) => {
  const {t} = useTranslation();

  const buttonConfig = useMemo(() => {
    return {
      label: t(
        `Surveys:subpanel.surveys_origin_selector.${surveysOrigin}.label`,
      ),
      onPress: () =>
        setSurveysOrigin(surveysOrigin === 'local' ? 'remote' : 'local'),
    };
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
