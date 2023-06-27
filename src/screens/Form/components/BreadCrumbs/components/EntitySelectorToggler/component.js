import React, {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {actions as formActions} from 'state/form';

import _styles from './styles';

const EntitySelectorToggler = ({customStyle}) => {
  const dispatch = useDispatch();
  const handleToggleEntitySelector = useCallback(() => {
    dispatch(formActions.toggleEntitySelector());
  }, [dispatch]);
  const styles = useThemedStyles(_styles);

  const touchableStyle = [styles.entitySelectorButton, customStyle];

  return (
    <TouchableIcon
      iconName="file-tree"
      onPress={handleToggleEntitySelector}
      customStyle={touchableStyle}
    />
  );
};

EntitySelectorToggler.defaultProps = {
  customStyle: null,
};

export default EntitySelectorToggler;
