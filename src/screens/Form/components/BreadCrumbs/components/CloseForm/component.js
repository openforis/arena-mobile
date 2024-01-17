import React, {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {Pressable, View} from 'react-native';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {actions as formActions} from 'state/form';

import _styles from './styles';
import {Text} from 'react-native-elements';

import {useGetNumberOfErrors} from 'screens/Form/components/ValidationReport/hooks';

const EntitySelectorToggler = ({customStyle}) => {
  const dispatch = useDispatch();
  const handleToggleEntitySelector = useCallback(() => {
    dispatch(formActions.toggleEntitySelector());
  }, [dispatch]);
  const styles = useThemedStyles(_styles);

  const touchableStyle = [styles.entitySelectorButton, customStyle];

  const numberOfErrors = useGetNumberOfErrors();

  const handleLeave = useCallback(() => {
    dispatch(formActions.leaveForm());
  }, [dispatch]);

  return (
    <Pressable onPress={numberOfErrors > 0 ? handleToggleEntitySelector : null}>
      <TouchableIcon
        iconName="close"
        customStyle={touchableStyle}
        onPress={numberOfErrors > 0 ? null : handleLeave}></TouchableIcon>

      {numberOfErrors > 0 && (
        <View style={styles.numberOfErrorsContainer}>
          <Text>{numberOfErrors}</Text>
        </View>
      )}
    </Pressable>
  );
};

EntitySelectorToggler.defaultProps = {
  customStyle: null,
};

export default EntitySelectorToggler;
