import {NodeDefType, NodeDefs} from '@openforis/arena-core';
import React, {useCallback, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import Pressable from 'arena-mobile-ui/components/Pressable';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {useCode} from 'form/Attributes/Code/Preview/hooks';
import {getValueAsString} from 'form/Attributes/common/BaseInput/Form';
import CopyToClipboard from 'form/Attributes/common/CopyToClipboard';
import AttributeHeader from 'form/common/Header';
import Validation from 'form/common/Validation';
import {selectors as formSelectors} from 'state/form';
import {
  useDeleteNode,
  useSelectNodeAndNodeDef,
} from 'state/form/hooks/useNodeFormActions';
import {
  selectors as nodesSelectors,
  actions as nodesActions,
} from 'state/nodes';
import {selectors as surveySelectors} from 'state/survey';

import _styles from './styles';

const BaseDeletePreviewNode = ({node}) => {
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

const BasePreviewNode = ({
  node,
  nodeDef,
  showValidation,
  NodeValueRender,
  canDelete,
}) => {
  const styles = useThemedStyles(_styles);

  const disabled = useSelector(state =>
    formSelectors.isNodeDefDisabled(state, nodeDef),
  );
  const isReadOnly = NodeDefs.isReadOnly(nodeDef);

  const handleSelectNodeAndNodeDef = useSelectNodeAndNodeDef({node, nodeDef});

  const validation = useMemo(() => {
    if (!showValidation) {
      return null;
    }
    return (
      <Validation
        nodeDef={nodeDef}
        nodes={[node]}
        showValidation={showValidation}
        absolute={true}
      />
    );
  }, [nodeDef, node, showValidation]);

  const styleNodeContainer = useMemo(() => {
    return StyleSheet.compose(
      styles.nodeContainer({nodeDef}),
      disabled ? styles.disabled : {},
    );
  }, [styles, nodeDef, disabled]);

  const nodeRendered = useMemo(() => {
    return (
      <>
        <View style={styles.block}>
          <NodeValueRender node={node} nodeDef={nodeDef} />
        </View>

        {validation}
      </>
    );
  }, [node, nodeDef, styles, validation]);
  return (
    <View style={styles.basePreviewContainer}>
      <Pressable
        style={styleNodeContainer}
        onPress={handleSelectNodeAndNodeDef}
        disabled={disabled}>
        {nodeRendered}
      </Pressable>
      {isReadOnly && (
        <CopyToClipboard value={getValueAsString(nodeDef, node)} />
      )}

      {canDelete && <BaseDeletePreviewNode node={node} />}
    </View>
  );
};

const BaseNodeValueRenderer = ({nodeDef}) => {
  const {t} = useTranslation();
  return (
    <View>
      <TextBase type="secondary">
        {t('Common:not_supported')}: {nodeDef.type}{' '}
      </TextBase>
    </View>
  );
};

const useIsDisabled = (nodeDef, node) => {
  const disabled = useSelector(state =>
    formSelectors.isNodeDefDisabled(state, nodeDef),
  );

  const {categoryItems} = useCode({
    nodeDef,
    node,
  });

  const parentEntityNodeDef = useSelector(state =>
    formSelectors.getParentEntityNodeDef(state, nodeDef),
  );

  if (!NodeDefType.code !== nodeDef.type) {
    return disabled;
  }

  return (
    disabled ||
    categoryItems.length === 0 ||
    NodeDefs.isEnumerate(parentEntityNodeDef)
  );
};

const _BasePreviewContainer = ({nodeDef, nodes, children}) => {
  const styles = useThemedStyles(_styles);
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const disabled = useIsDisabled(nodeDef, nodes);

  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const lastNodeDefUuid = useSelector(nodesSelectors.getLastNodeDefUuid);
  const containerStyle = useMemo(() => {
    return StyleSheet.compose(
      StyleSheet.compose(styles.container, disabled ? styles.disabled : {}),
      lastNodeDefUuid === nodeDef.uuid ? styles.lastNodeDef : {},
    );
  }, [styles, disabled, lastNodeDefUuid, nodeDef]);

  const hidden = useMemo(() => {
    const layoutProps = NodeDefs.getLayoutProps(cycle)(nodeDef);

    return (
      !applicable &&
      NodeDefs.isHiddenWhenNotRelevant(cycle)(nodeDef) &&
      layoutProps.hiddenInMobile
    );
  }, [applicable, cycle, nodeDef]);

  const header = useMemo(() => {
    return (
      <AttributeHeader
        nodeDef={nodeDef}
        nodes={nodes}
        showDescription={false}
        disabled={disabled}
      />
    );
  }, [nodeDef, nodes, disabled]);

  if (hidden) {
    return <></>;
  }

  return (
    <View style={containerStyle}>
      {header}
      {children}
    </View>
  );
};

export const BasePreviewContainer = ({nodeDef, nodes, children}) => {
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const cycle = useSelector(surveySelectors.getSurveyCycle);

  const hidden = useMemo(() => {
    return !applicable && NodeDefs.isHiddenWhenNotRelevant(cycle)(nodeDef);
  }, [applicable, cycle, nodeDef]);

  if (hidden) {
    return <></>;
  }

  return (
    <_BasePreviewContainer nodeDef={nodeDef} nodes={nodes}>
      {children}
    </_BasePreviewContainer>
  );
};

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

  const content = useMemo(() => {
    const numberOfNodes = nodes.length > 1;
    return (
      <>
        {nodes?.map(node => (
          <BasePreviewNode
            key={node.uuid}
            node={node}
            nodeDef={nodeDef}
            showValidation={numberOfNodes}
            NodeValueRender={NodeValueRender}
            canDelete={nodeDef?.props?.multiple}
          />
        ))}
        {nodeDef?.props?.multiple && canAddNode && (
          <CreateNode nodeDef={nodeDef} onPress={_createNode} />
        )}
      </>
    );
  }, [nodes, nodeDef, NodeValueRender, canAddNode, _createNode]);

  return (
    <BasePreviewContainer nodeDef={nodeDef} nodes={nodes}>
      {content}
    </BasePreviewContainer>
  );
};

export default BasePreview;
