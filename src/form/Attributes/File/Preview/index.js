import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import baseStyles from 'arena-mobile-ui/styles';
import {BasePreviewContainer} from 'form/Attributes/common/Base/Preview';
import {selectors as formSelectors} from 'state/form';

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
  return (
    <Button
      onPress={onPress}
      type="secondary"
      customContainerStyle={styles.bottonContainer}
      label={node?.value?.fileName}
    />
  );
};

const NodeValueRender = ({node = false, nodeDef}) => {
  const {updateFile, createFile, deleteFile} = useFile({node, nodeDef});

  return (
    <Container>
      <LoadFileButton
        node={node}
        onPress={node?.value ? updateFile : createFile}
      />
      {node?.value && (
        <>
          <FileLabel node={node} onPress={updateFile} />
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
      <NodeValueRender key="empty" nodeDef={nodeDef} />
    </BasePreviewContainer>
  );
};

export default Preview;
