import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useDispatch} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import {actions as formActions} from 'state/form';

const BaseForm = () => {
  const dispatch = useDispatch();

  const handleClose = useCallback(() => {
    dispatch(formActions.setNode({node: false}));
  }, [dispatch]);

  return (
    <View>
      <View style={{justifyContent: 'flex-end', flexDirection: 'row'}}>
        <TouchableIcon
          iconName="close"
          customStyle={{
            backgroundColor: colors.neutralLighter,
            borderRadius: 4,
            padding: 4,
          }}
          onPress={handleClose}
        />
      </View>
    </View>
  );
};

export default BaseForm;
