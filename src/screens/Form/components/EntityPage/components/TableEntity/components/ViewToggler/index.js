import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import baseStyles from 'arena-mobile-ui/styles';
import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';

import styles from './styles';

const Viewtoggler = () => {
  const isEntityShowAsTable = useSelector(formSelectors.isEntityShowAsTable);
  const dispatch = useDispatch();

  const handleToggleTable = useCallback(() => {
    dispatch(formActions.toggleEntityShowAsTable());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <View />
      <TouchableIcon
        iconName={isEntityShowAsTable ? 'format-list-checks' : 'table-large'}
        customStyle={styles.icon}
        hitSlop={baseStyles.bases.BASE_6}
        size={baseStyles.bases.BASE_8}
        onPress={handleToggleTable}
      />
    </View>
  );
};

export default Viewtoggler;
