import {NodeDefs} from '@openforis/arena-core';
import React, {useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import AttributeHeader from 'form/common/Header';
import Validation from 'form/common/Validation';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {useDeleteNode} from 'state/form/hooks/useNodeFormActions';
import {
  selectors as nodesSelectors,
  actions as nodesActions,
} from 'state/nodes';
import {selectors as surveySelectors} from 'state/survey';

import _styles from './styles';

const BaseDeletePreviewNode = ({node}) => {
  const styles = useThemedStyles({styles: _styles});
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

const BasePreviewNode = ({
  node,
  nodeDef,
  showValidation,
  NodeValueRender,
  canDelete,
}) => {
  const dispatch = useDispatch();

  const styles = useThemedStyles({styles: _styles});

  const disabled = useSelector(state =>
    formSelectors.isNodeDefDisabled(state, nodeDef),
  );

  const handleSelectNodeAndNodeDef = useCallback(() => {
    dispatch(formActions.setNode({node: node}));
  }, [dispatch, node]);

  return (
    <View style={[styles.basePreviewContainer]}>
      <TouchableOpacity
        style={styles.nodeContainer({nodeDef})}
        onPress={handleSelectNodeAndNodeDef}
        disabled={disabled}>
        <View style={styles.block}>
          <NodeValueRender node={node} nodeDef={nodeDef} />
        </View>

        <Validation
          nodeDef={nodeDef}
          nodes={[node]}
          showValidation={showValidation}
          absolute={true}
        />
      </TouchableOpacity>
      {canDelete && <BaseDeletePreviewNode node={node} />}
    </View>
  );
};

const BaseNodeValueRenderer = ({nodeDef}) => {
  const {t} = useTranslation();
  return (
    <View>
      <Text>
        {t('Common:not_supported')}: {nodeDef.type}{' '}
      </Text>
    </View>
  );
};

export const BasePreviewContainer = ({nodeDef, nodes, children}) => {
  const styles = useThemedStyles({styles: _styles});
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );
  const disabled = useSelector(state =>
    formSelectors.isNodeDefDisabled(state, nodeDef),
  );
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const lastNodeDefUuid = useSelector(nodesSelectors.getLastNodeDefUuid);
  const hidden =
    !applicable && NodeDefs.isHiddenWhenNotRelevant(cycle)(nodeDef);
  if (hidden) {
    return <></>;
  }
  return (
    <View
      style={[
        styles.container,
        disabled ? styles.disabled : {},
        lastNodeDefUuid === nodeDef.uuid ? styles.lastNodeDef : {},
      ]}>
      <AttributeHeader
        nodeDef={nodeDef}
        nodes={nodes}
        showDescription={false}
      />
      {children}
    </View>
  );
};

const CreateNode = ({onPress, nodeDef}) => {
  const styles = useThemedStyles({styles: _styles});
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

const BasePreview = ({nodeDef, NodeValueRender = BaseNodeValueRenderer}) => {
  const dispatch = useDispatch();
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const canAddNode = useSelector(state =>
    formSelectors.canAddNode(state, nodeDef),
  );

  const _createNode = useCallback(() => {
    dispatch(nodesActions.createNode({nodeDef, parentNode: parentEntityNode}));
  }, [dispatch, nodeDef, parentEntityNode]);

  useEffect(() => {
    if (nodeDef && parentEntityNode && nodes.length === 0) {
      _createNode();
    }
  }, [dispatch, parentEntityNode, nodeDef, nodes, _createNode]);

  return (
    <BasePreviewContainer nodeDef={nodeDef} nodes={nodes}>
      {nodes?.map(node => (
        <BasePreviewNode
          key={node.uuid}
          node={node}
          nodeDef={nodeDef}
          showValidation={nodes.length > 1}
          NodeValueRender={NodeValueRender}
          canDelete={nodeDef?.props?.multiple}
        />
      ))}
      {nodeDef?.props?.multiple && canAddNode && (
        <CreateNode nodeDef={nodeDef} onPress={_createNode} />
      )}
    </BasePreviewContainer>
  );
};

export default BasePreview;
