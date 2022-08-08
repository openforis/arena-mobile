import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import AttributeHeader from 'form/common/Header';
import {actions as formActions} from 'state/form';

import styles from './styles';

const BaseForm = ({nodeDef, handleSubmit, children}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const _handleSubmit = useCallback(
    ({callback = null} = {}) => {
      handleSubmit({callback});
    },
    [handleSubmit],
  );

  const handleClose = useCallback(() => {
    dispatch(formActions.setNode({node: false}));
  }, [dispatch]);

  const _handleSubmitAndClose = useCallback(() => {
    _handleSubmit({callback: handleClose});
  }, [_handleSubmit, handleClose]);

  return (
    <View>
      <View style={styles.closeHeader}>
        <TouchableIcon
          iconName="close"
          customStyle={styles.closeIcon}
          onPress={handleClose}
        />
      </View>
      <AttributeHeader nodeDef={nodeDef} showValidation={false} />
      {children}

      <View style={styles.divider} />
      <View>
        <Button
          label={t('Form:save_and_return')}
          onPress={_handleSubmitAndClose}
        />
      </View>
    </View>
  );
};

export default BaseForm;
