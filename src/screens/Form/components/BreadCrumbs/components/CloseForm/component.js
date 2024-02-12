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
  const numberOfErrors = useGetNumberOfErrors();

  const handleTogglePress = useCallback(() => {
    if (numberOfErrors > 0) {
      dispatch(formActions.toggleEntitySelector());
    } else {
      dispatch(formActions.leaveForm());
    }
  }, [dispatch, numberOfErrors]);
  const styles = useThemedStyles(_styles);

  const touchableStyle = [styles.entitySelectorButton, customStyle];

  return (
    <Pressable onPress={handleTogglePress}>
      <TouchableIcon
        iconName="close"
        customStyle={touchableStyle}
        onPress={handleTogglePress}></TouchableIcon>

      {numberOfErrors > 0 && (
        <View style={styles.numberOfErrorsContainer}>
          <Text>{numberOfErrors}</Text>
        </View>
      )}
    </Pressable>
  );
};

export default EntitySelectorToggler;
