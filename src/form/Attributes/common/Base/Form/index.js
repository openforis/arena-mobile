import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import AttributeHeader from 'form/common/Header';
import {useCloseNode} from 'state/form/hooks/useNodeFormActions';

import styles from './styles';

const BaseForm = ({
  nodeDef,
  handleSubmit,
  children,
  hasSubmitButton = true,
}) => {
  const {t} = useTranslation();

  const _handleSubmit = useCallback(
    ({callback = null} = {}) => {
      handleSubmit({callback});
    },
    [handleSubmit],
  );

  const handleClose = useCloseNode();

  const _handleSubmitAndClose = useCallback(() => {
    _handleSubmit({callback: handleClose});
  }, [_handleSubmit, handleClose]);

  return (
    <View style={styles.container}>
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
      {hasSubmitButton && (
        <View>
          <Button
            label={t('Form:save_and_return')}
            onPress={_handleSubmitAndClose}
          />
        </View>
      )}
    </View>
  );
};

export default BaseForm;
