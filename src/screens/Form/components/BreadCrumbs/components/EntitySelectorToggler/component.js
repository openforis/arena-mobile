import React, {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import {actions as formActions} from 'state/form';

import styles from './styles';

const EntitySelectorToggler = ({customStyle = {}}) => {
  const dispatch = useDispatch();
  const handleToggleEntitySelector = useCallback(() => {
    dispatch(formActions.toggleEntitySelector());
  }, [dispatch]);
  return (
    <TouchableIcon
      iconName="file-tree"
      onPress={handleToggleEntitySelector}
      customStyle={[styles.entitySelectorButton, customStyle]}
    />
  );
};

export default EntitySelectorToggler;
