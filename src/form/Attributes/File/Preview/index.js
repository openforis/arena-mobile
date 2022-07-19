import {NodeDefs, Objects} from '@openforis/arena-core';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import baseStyles from 'arena-mobile-ui/styles';
import {BasePreviewContainer} from 'form/Attributes/common/Base/Preview';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import {useFile} from '../hooks';

import styles from './styles';

const LoadFileButton = ({onPress}) => {
  return (
    <Button
      onPress={onPress}
      type="secondary"
      icon={<Icon name="upload" size={baseStyles.bases.BASE_4} />}
      customContainerStyle={styles.buttonContainer}
    />
  );
};

const DeleteFileButton = ({onPress}) => {
  return (
    <Button
      onPress={onPress}
      type="ghostBlack"
      icon={<Icon name="trash-can-outline" size={baseStyles.bases.BASE_4} />}
      customContainerStyle={styles.buttonContainer}
    />
  );
};

const Container = ({children}) => (
  <View style={styles.container}>{children}</View>
);

const FileLabel = ({node, onPress}) => {
  const dispatch = useDispatch();
  const handleSelectNodeAndNodeDef = useCallback(
    event => {
      console.log('LONG');
      event.stopPropagation();
      //dispatch(formActions.setNode({node: node}));
    },
    [dispatch, node],
  );

  return (
    <Button
      onPress={onPress}
      type="secondary"
      customContainerStyle={styles.bottonContainer}
      label={node?.value?.fileName}
      onLongPress={handleSelectNodeAndNodeDef}
    />
  );
};

const NodeValueRender = ({node = false, nodeDef}) => {
  const {updateFile, createFile, deleteFile} = useFile({
    node,
    nodeDef,
    isImage: ['image', 'video'].includes(nodeDef?.props?.fileType),
  });

  return (
    <Container>
      <LoadFileButton
        node={node}
        onPress={node?.uuid ? updateFile : createFile}
      />
      {node?.value && (
        <>
          <FileLabel node={node} nodeDef={nodeDef} onPress={updateFile} />
          <DeleteFileButton node={node} onPress={deleteFile} />
        </>
      )}
    </Container>
  );
};

const Preview = ({nodeDef}) => {
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  return (
    <BasePreviewContainer nodeDef={nodeDef} nodes={nodes}>
      {nodes.map(node => (
        <NodeValueRender key={node.uuid} node={node} nodeDef={nodeDef} />
      ))}
      {(NodeDefs.isMultiple(nodeDef) || nodes.length === 0) && (
        <NodeValueRender key="empty" nodeDef={nodeDef} />
      )}
    </BasePreviewContainer>
  );
};

export default Preview;
