import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Switch} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';

import Pressable from 'arena-mobile-ui/components/Pressable';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as appSelectors, actions as appActions} from 'state/app';

import _styles from './styles';

const ForceMaxResolution = () => {
  const styles = useThemedStyles(_styles);

  const dispatch = useDispatch();

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
    <Pressable onPress={handleSetIsMaxResolution} style={styles.container}>
      <TextBase type="header">
        {t('Settings:images_quality_and_size.screen.max_resolution.title')}
      </TextBase>
      <Switch
        value={isMaxResolution}
        onValueChange={handleSetIsMaxResolution}
        color="green"
      />
    </Pressable>
  );
};

export default ForceMaxResolution;
