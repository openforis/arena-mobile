import {NodeDefs} from '@openforis/arena-core';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import BaseContainer from 'form/Attributes/common/Base/common/BaseContainer';
import {selectors as filesSelectors} from 'state/files';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import {FileImage} from '../components/Preview/component';
import {useFile, useFilePickerModal} from '../hooks';

import styles from './styles';

const LoadFileButton = ({onPress, disabled}) => {
  return (
    <Button
      onPress={onPress}
      type="secondary"
      icon={<Icon name="upload" size="s" />}
      disabled={disabled}
    />
  );
};

const DeleteFileButton = ({onPress, disabled}) => {
  return (
    <Button
      onPress={onPress}
      type="ghostBlack"
      icon={<Icon name="trash-can-outline" size="s" />}
      disabled={disabled}
    />
  );
};

const Container = ({children}) => (
  <View style={styles.container}>{children}</View>
);

const FilePreview = ({node}) => {
  const dispatch = useDispatch();
  const handleSelectNodeAndNodeDef = useCallback(
    event => {
      event.stopPropagation();
      dispatch(formActions.setNode({node: node}));
    },
    [dispatch, node],
  );
  const file = useSelector(state =>
    filesSelectors.getFileByUuid(state, node?.value?.fileUuid),
  );

  return (
    <Button
      icon={
        <View style={styles.previewThumbnail}>
          <FileImage file={file} />
        </View>
      }
      iconPosition="left"
      onPress={handleSelectNodeAndNodeDef}
      type="secondary"
      customContainerStyle={styles.bottonContainer}
      customTextStyle={styles.fileLabel}
      label={''}
      allowMultipleLines={true}
    />
  );
};

const NodeValueRender = ({node = false, nodeDef}) => {
  const {deleteFile, handleByPickerType} = useFile({
    node,
    nodeDef,
  });
  const {toggleModal, modal} = useFilePickerModal({
    node,
    nodeDef,
    handleByPickerType,
  });

  const isRecordLocked = useSelector(formSelectors.isRecordLocked);
  return (
    <>
      <Container>
        {node?.value ? (
          <>
            <FilePreview node={node} nodeDef={nodeDef} />
            <DeleteFileButton
              node={node}
              onPress={deleteFile}
              disabled={isRecordLocked}
            />
          </>
        ) : (
          <LoadFileButton
            node={node}
            onPress={toggleModal}
            disabled={isRecordLocked}
          />
        )}
      </Container>
      {modal}
    </>
  );
};

const Preview = ({nodeDef}) => {
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  const renderNodes = useMemo(() => {
    if (nodeDef && (NodeDefs.isMultiple(nodeDef) || nodes.length === 0)) {
      return (
        <NodeValueRender key={`empty_${nodes.length}`} nodeDef={nodeDef} />
      );
    }
    return (
      <>
        {nodes?.map(node => (
          <NodeValueRender key={node.uuid} node={node} nodeDef={nodeDef} />
        ))}
      </>
    );
  }, [nodeDef, nodes]);

  return (
    <BaseContainer nodeDef={nodeDef} nodes={nodes}>
      {renderNodes}
    </BaseContainer>
  );
};

export default Preview;
