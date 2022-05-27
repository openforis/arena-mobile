import * as React from 'react';
import {useDispatch} from 'react-redux';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import {actions as formActions} from 'state/form';

import styles from './styles';

const EntitySelectorToggler = () => {
  const dispatch = useDispatch();
  const handletoggleEntitySelector = React.useCallback(() => {
    dispatch(formActions.toggleEntitySelector());
  }, [dispatch]);
  return (
    <TouchableIcon
      iconName="git-network-outline"
      onPress={handletoggleEntitySelector}
      customStyle={styles.entitySelectorButton}
    />
  );
};

export default EntitySelectorToggler;
