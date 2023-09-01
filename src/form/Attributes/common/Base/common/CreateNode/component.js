import React from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as formSelectors} from 'state/form';

import _styles from './styles';

const CreateNode = ({onPress, nodeDef}) => {
  const styles = useThemedStyles(_styles);
  const {t} = useTranslation();
  const disabled = useSelector(state =>
    formSelectors.isNodeDefDisabled(state, nodeDef),
  );

  return (
    <Button
      type="ghostBlack"
      icon={<Icon name="plus" size="s" />}
      label={t('Form:add_new', {label: ''})}
      customContainerStyle={styles.buttonContainer}
      onPress={onPress}
      disabled={disabled}
    />
  );
};

export default CreateNode;
