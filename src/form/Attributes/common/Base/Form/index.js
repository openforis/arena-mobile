import {NodeDefType, NodeDefs} from '@openforis/arena-core';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import AttributeHeader from 'form/common/Header';
import {selectors as formSelectors} from 'state/form';
import {useCloseNode} from 'state/form/hooks/useNodeFormActions';
import {actions as nodesActions} from 'state/nodes';

import _styles from './styles';

const AddNodeButton = ({nodeDef}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const canAddNode = useSelector(state =>
    formSelectors.canAddNode(state, nodeDef),
  );

  const _createNode = useCallback(() => {
    dispatch(
      nodesActions.createNode({
        nodeDef,
        parentNode: parentEntityNode,
        selectNode: true,
      }),
    );
  }, [dispatch, nodeDef, parentEntityNode]);

  if (
    NodeDefs.isMultiple(nodeDef) &&
    canAddNode &&
    NodeDefs.getType(nodeDef) !== NodeDefType.code
  ) {
    return <Button label={t('Form:done_and_new')} onPress={_createNode} />;
  }
  return null;
};

const BaseForm = ({
  nodeDef,
  handleSubmit,
  children,
  hasSubmitButton,
  nodes,
}) => {
  const styles = useThemedStyles(_styles);
  const {t} = useTranslation();

  const _handleSubmit = useCallback(
    ({callback = null} = {}) => {
      handleSubmit?.({callback});
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
      <AttributeHeader
        nodeDef={nodeDef}
        showValidation={true}
        nodes={nodes}
        showDescription={true}
      />
      {children}

      <View style={styles.divider} />
      {hasSubmitButton && (
        <View style={styles.buttonsContainer}>
          <AddNodeButton nodeDef={nodeDef} />
          <Button label={t('Form:done')} onPress={_handleSubmitAndClose} />
        </View>
      )}
    </View>
  );
};

BaseForm.defaultProps = {
  hasSubmitButton: true,
  handleSubmit: () => {},
};

export default BaseForm;
