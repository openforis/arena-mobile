import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useDispatch} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import AttributeHeader from 'form/common/Header';
import {actions as formActions} from 'state/form';

import styles from './styles';

const BaseForm = ({nodeDef, handleSubmit, children}) => {
  const dispatch = useDispatch();

  const _handleSubmit = useCallback(
    ({callback = null} = {}) => {
      handleSubmit({callback});
    },
    [handleSubmit],
  );

  const _handleSubmitAndClose = useCallback(() => {
    _handleSubmit({callback: _handleClose});
  }, [_handleSubmit, _handleClose]);

  const _handleClose = useCallback(() => {
    dispatch(formActions.setNode({node: false}));
  }, [dispatch]);

  return (
    <View>
      <View style={styles.closeHeader}>
        <TouchableIcon
          iconName="close"
          customStyle={styles.closeIcon}
          onPress={_handleClose}
        />
      </View>
      <AttributeHeader nodeDef={nodeDef} showValidation={false} />
      {children}

      <View style={styles.divider} />
      <View>
        <Button label="save" onPress={_handleSubmit} />
        <Button label="save and close" onPress={_handleSubmitAndClose} />
      </View>
    </View>
  );
};

export default BaseForm;
