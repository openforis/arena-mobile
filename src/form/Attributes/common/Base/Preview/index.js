import {t} from 'i18next';
import React, {useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import baseStyles from 'arena-mobile-ui/styles';
import AttributeHeader from 'form/common/Header';
import Validation from 'form/common/Validation';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {actions as nodesActions} from 'state/nodes';

import styles from './styles';

const _useIsActive = () => {
  return true;
};

const BasePreviewNode = ({
  node,
  nodeDef,
  showValidation,
  NodeValueRender,
  useIsActive = _useIsActive,
}) => {
  const dispatch = useDispatch();

  const isActive = useIsActive({node, nodeDef});
  const handleSelectNodeAndNodeDef = useCallback(() => {
    dispatch(formActions.setNode({node: node}));
  }, [dispatch, node]);

  return (
    <TouchableOpacity
      style={styles.nodeContainer({nodeDef, isActive})}
      onPress={handleSelectNodeAndNodeDef}
      disabled={!isActive}>
      <View style={{flex: 1}}>
        <NodeValueRender node={node} nodeDef={nodeDef} />
      </View>

      <Validation
        nodeDef={nodeDef}
        nodes={[node]}
        showValidation={showValidation}
        absolute={true}
      />
    </TouchableOpacity>
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
  return (
    <View style={styles.container}>
      <AttributeHeader nodeDef={nodeDef} nodes={nodes} />
      {children}
    </View>
  );
};

const CreateNode = ({onPress}) => {
  const {t} = useTranslation();
  return (
    <Button
      type="ghostBlack"
      icon={<Icon name="plus" size={baseStyles.bases.BASE_4} />}
      label={t('Form:add_new', {label: ''})}
      customContainerStyle={styles.buttonContainer}
      onPress={onPress}
    />
  );
};

const BasePreview = ({
  nodeDef,
  NodeValueRender = BaseNodeValueRenderer,
  useIsActive,
}) => {
  const dispatch = useDispatch();
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);

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
          useIsActive={useIsActive}
        />
      ))}
      {nodeDef.props.multiple && <CreateNode onPress={_createNode} />}
    </BasePreviewContainer>
  );
};

export default BasePreview;
