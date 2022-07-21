import React from 'react';
import {View, SafeAreaView} from 'react-native';
import Modal from 'react-native-modal';

import PickerButton from '../PickerButton';

import styles from './styles';

export const pickerTypes = {
  camera: 'camera',
  galery: 'galery',
  document: 'document',
  audio: 'audio',
};
const pickersWithIcon = {
  [pickerTypes.camera]: {
    key: pickerTypes.camera,
    icon: 'camera',
    label: 'camera',
  },
  [pickerTypes.galery]: {
    key: pickerTypes.galery,
    icon: 'folder-multiple-image',
    label: 'galery',
  },
  [pickerTypes.document]: {
    key: pickerTypes.document,
    icon: 'file',
    label: 'document',
  },
};

const FilePickerModal = ({isModalVisible, toggleModal, handleByPickerType}) => {
  return (
    <Modal
      isVisible={isModalVisible}
      onBackdropPress={toggleModal}
      style={styles.modalContainer}
      avoidKeyboard={true}>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          {Object.values(pickersWithIcon).map(picker => (
            <PickerButton
              picker={picker}
              key={picker.key}
              handleByPickerType={handleByPickerType}
            />
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default FilePickerModal;
