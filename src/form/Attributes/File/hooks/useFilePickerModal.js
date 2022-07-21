import React, {useCallback, useState, useMemo, useEffect} from 'react';

import FilePickerModal, {
  pickerTypes as _pickerTypes,
} from '../components/FilePickerModal';

export const pickerTypes = _pickerTypes;

const useFilePickerModal = ({node, nodeDef, handleByPickerType}) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = useCallback(() => {
    setModalVisible(prevValue => !prevValue);
  }, [setModalVisible]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, [setModalVisible]);

  const modal = useMemo(
    () => (
      <FilePickerModal
        node={node}
        nodeDef={nodeDef}
        toggleModal={toggleModal}
        isModalVisible={isModalVisible}
        handleByPickerType={handleByPickerType}
      />
    ),
    [isModalVisible, toggleModal, node, nodeDef, handleByPickerType],
  );

  useEffect(() => {
    if (node?.value) {
      closeModal();
    }
  }, [node, closeModal]);

  return {
    closeModal,
    toggleModal,
    isModalVisible,
    modal: modal,
  };
};

export default useFilePickerModal;
