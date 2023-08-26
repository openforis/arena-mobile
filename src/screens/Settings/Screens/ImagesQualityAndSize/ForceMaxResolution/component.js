import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector, useDispatch} from 'react-redux';

import Switch from 'arena-mobile-ui/components/Switch';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as appSelectors, actions as appActions} from 'state/app';

import _styles from './styles';

const ForceMaxResolution = () => {
  const dispatch = useDispatch();
  const styles = useThemedStyles(_styles);

  const isMaxResolution = useSelector(appSelectors.getIsMaxResolution);

  const handleSetIsMaxResolution = useCallback(() => {
    dispatch(
      appActions.setIsMaxResolution({
        isMaxResolution: !isMaxResolution,
      }),
    );
  }, [dispatch, isMaxResolution]);

  const {t} = useTranslation();

  return (
    <Switch
      title={t('Settings:images_quality_and_size.screen.max_resolution.title')}
      value={isMaxResolution}
      onValueChange={handleSetIsMaxResolution}
      customContainerStyle={styles.container}
    />
  );
};

export default ForceMaxResolution;
