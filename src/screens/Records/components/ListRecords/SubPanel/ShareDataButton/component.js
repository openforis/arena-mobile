import React, {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {actions as surveyActions} from 'state/survey';

import _styles from './styles';

const ShareDataButton = () => {
  const styles = useThemedStyles(_styles);

  const dispatch = useDispatch();

  const onPress = useCallback(() => {
    dispatch(surveyActions.shareSurveyData());
  }, [dispatch]);

  return (
    <Button
      onPress={onPress}
      type="neutral"
      customContainerStyle={styles.button}
      iconPosition={'right'}
      icon={
        <Icon
          name="share"
          color={styles.colors.secondaryContrastText}
        />
      }
    />
  );
};

export default ShareDataButton;
