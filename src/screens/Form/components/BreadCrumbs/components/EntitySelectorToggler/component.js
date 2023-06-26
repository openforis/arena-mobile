import React, {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {actions as formActions} from 'state/form';

import _styles from './styles';

const EntitySelectorToggler = ({customStyle = {}}) => {
  const dispatch = useDispatch();
  const handleToggleEntitySelector = useCallback(() => {
    dispatch(formActions.toggleEntitySelector());
  }, [dispatch]);
  const styles = useThemedStyles(_styles);
  return (
    <TouchableIcon
      iconName="file-tree"
      onPress={handleToggleEntitySelector}
      customStyle={[styles.entitySelectorButton, customStyle]}
    />
  );
};

export default EntitySelectorToggler;
