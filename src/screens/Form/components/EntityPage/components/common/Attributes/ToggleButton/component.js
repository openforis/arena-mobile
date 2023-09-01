import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import _styles from './styles';

const ToggleSingleMode = () => {
  const styles = useThemedStyles(_styles);
  const isSingleNodeView = useSelector(formSelectors.isSingleNodeView);
  const dispatch = useDispatch();

  const handleToggle = useCallback(() => {
    dispatch(formActions.toggleSingleNodeView());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <TouchableIcon
        iconName={isSingleNodeView ? 'format-textbox' : 'format-line-style'}
        onPress={handleToggle}
        customStyle={styles.toggleButton}
      />
    </View>
  );
};

export default ToggleSingleMode;
