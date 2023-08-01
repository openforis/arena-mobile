import React from 'react';
import {useTranslation} from 'react-i18next';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const PickerButton = ({picker, handleByPickerType}) => {
  const {t} = useTranslation();
  const styles = useThemedStyles(_styles);
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
