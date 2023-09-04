import React, {useCallback} from 'react';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {useDeleteNode} from 'state/form/hooks/useNodeFormActions';

import _styles from './styles';

const BaseDeleteNode = ({node}) => {
  const styles = useThemedStyles(_styles);
  const handleDelete = useDeleteNode();

  const _handleDelete = useCallback(() => {
    handleDelete({
      node,
      label: typeof node.value === 'string' ? node.value : false,
      requestConfirm: false,
    });
  }, [handleDelete, node]);

  return (
    <Button
      onPress={_handleDelete}
      type="ghostBlack"
      icon={<Icon name="trash-can-outline" size="s" />}
      customContainerStyle={styles.buttonContainer}
    />
  );
};

export default BaseDeleteNode;
