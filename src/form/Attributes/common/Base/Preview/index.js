import {NodeDefs} from '@openforis/arena-core';
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
import {
  selectors as nodesSelectors,
  actions as nodesActions,
} from 'state/nodes';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';

// TODO move to arena-core
NodeDefs.isHiddenWhenNotRelevant = ({nodeDef, cycle = '0'}) => {
  return nodeDef?.props?.layout?.[cycle]?.hiddenWhenNotRelevant;
};

const BasePreviewNode = ({node, nodeDef, showValidation, NodeValueRender}) => {
  const dispatch = useDispatch();

  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );
  const handleSelectNodeAndNodeDef = useCallback(() => {
    dispatch(formActions.setNode({node: node}));
  }, [dispatch, node]);

  return (
    <TouchableOpacity
      style={styles.nodeContainer({nodeDef})}
      onPress={handleSelectNodeAndNodeDef}
      disabled={!applicable}>
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
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const lastNodeDefUuid = useSelector(nodesSelectors.getLastNodeDefUuid);
  return (
    <View
      style={[
        styles.container,
        applicable
          ? {}
          : styles.notApplicable({
              hidden: NodeDefs.isHiddenWhenNotRelevant({nodeDef, cycle}),
            }),

        lastNodeDefUuid === nodeDef.uuid ? styles.lastNodeDef : {},
      ]}>
      <AttributeHeader nodeDef={nodeDef} nodes={nodes} />
      {children}
    </View>
  );
};

const CreateNode = ({onPress, nodeDef}) => {
  const {t} = useTranslation();
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );
  return (
    <Button
      type="ghostBlack"
      icon={<Icon name="plus" size={baseStyles.bases.BASE_4} />}
      label={t('Form:add_new', {label: ''})}
      customContainerStyle={styles.buttonContainer}
      onPress={onPress}
      disabled={!applicable}
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
        />
      ))}
      {nodeDef?.props?.multiple && canAddNode && (
        <CreateNode nodeDef={nodeDef} onPress={_createNode} />
      )}
    </BasePreviewContainer>
  );
};

export default BasePreview;
