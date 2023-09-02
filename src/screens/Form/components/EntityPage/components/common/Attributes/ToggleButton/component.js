import React, {useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Keyboard, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import _styles from './styles';

const ToggleSingleMode = () => {
  const styles = useThemedStyles(_styles);
  const isSingleNodeView = useSelector(formSelectors.isSingleNodeView);
  const dispatch = useDispatch();

  const {t} = useTranslation();
  const handleToggle = useCallback(() => {
    dispatch(formActions.toggleSingleNodeView());
  }, [dispatch]);

  useEffect(() => {
    if (!isSingleNodeView) {
      Keyboard.dismiss();
    }
  }, [isSingleNodeView]);

  return (
    <View style={styles.container}>
      <Button
        onPress={handleToggle}
        customStyle={styles.toggleButton}
        type="ghostBlack"
        iconPosition="right"
        icon={
          <Icon
            name={!isSingleNodeView ? 'format-textbox' : 'format-line-style'}
            size="s"
          />
        }
        label={t(`Form:show_as.${!isSingleNodeView ? 'single_node' : 'list'}`)}
      />
    </View>
  );
};

export default ToggleSingleMode;
