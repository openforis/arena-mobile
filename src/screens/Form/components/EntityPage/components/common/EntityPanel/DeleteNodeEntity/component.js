import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import baseStyles from 'arena-mobile-ui/styles';
import {alert} from 'arena-mobile-ui/utils';
import {selectors as formSelectors, actions as formActions} from 'state/form';

const TrashIconRed = (
  <Icon
    name="trash-can-outline"
    size={baseStyles.fontSizes.l}
    color={colors.error}
  />
);
import styles from './styles';

const DeleteNodeEntity = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const parentEntityKeyString = useSelector(state =>
    formSelectors.getEntityKey(state, parentEntityNode),
  );

  const parentLabel = useNodeDefNameOrLabel({nodeDef: parentEntityNodeDef});

  const handleDeleteEntityNode = useCallback(() => {
    alert({
      title: t('Form:deleteNode.alert.title'),
      message: t('Form:deleteNode.alert.message', {
        name: `${parentLabel} [${parentEntityKeyString}]`,
      }),
      acceptText: t('Form:deleteNode.alert.accept'),
      dismissText: t('Form:deleteNode.alert.dismiss'),
      onAccept: () => {
        dispatch(formActions.deleteNodeEntity({node: parentEntityNode}));
      },
      onDismiss: () => null,
    });
  }, [dispatch, parentEntityKeyString, parentLabel, parentEntityNode, t]);

  return (
    <Button
      type="deleteGhost"
      icon={TrashIconRed}
      label={t('Form:navigation_panel.multiple.delete_this_item')}
      customContainerStyle={styles.buttonContainer}
      onPress={handleDeleteEntityNode}
    />
  );
};

export default DeleteNodeEntity;
