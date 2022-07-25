import React from 'react';
import {useTranslation} from 'react-i18next';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';

import styles from './styles';

const PickerButton = ({picker, handleByPickerType}) => {
  const {t} = useTranslation();
  return (
    <Button
      label={t(`Form:nodeDefFile.pickers.${picker.label}`)}
      onPress={handleByPickerType(picker.key)}
      type="ghostBlack"
      icon={<Icon name={picker.icon} />}
      customContainerStyle={styles.container}
    />
  );
};

export default PickerButton;
