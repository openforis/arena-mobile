import React from 'react';
import {View, SafeAreaView} from 'react-native';
import Modal from 'react-native-modal';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import PickerButton from '../PickerButton';

import _styles from './styles';

export const pickerTypes = {
  camera: 'camera',
  gallery: 'gallery',
  document: 'document',
  audio: 'audio',
};
const pickersWithIcon = {
  [pickerTypes.camera]: {
    key: pickerTypes.camera,
    icon: 'camera',
    label: 'camera',
  },
  [pickerTypes.gallery]: {
    key: pickerTypes.gallery,
    icon: 'folder-multiple-image',
    label: 'gallery',
  },
  [pickerTypes.document]: {
    key: pickerTypes.document,
    icon: 'file',
    label: 'document',
  },
};

const FilePickerModal = ({isModalVisible, toggleModal, handleByPickerType}) => {
  const styles = useThemedStyles(_styles);
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
