import React from 'react';
import {View, Text, SafeAreaView, ScrollView} from 'react-native';
import Modal from 'react-native-modal';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';

import styles from './styles';

const DetailModal = ({isModalVisible, toggleModal, nodeDef}) => {
  return (
    <Modal
      isVisible={isModalVisible}
      onBackdropPress={toggleModal}
      style={styles.modalContainer}
      avoidKeyboard={true}>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.modalPayloadContainer}>
          <TouchableIcon onPress={toggleModal} iconName="close" />
          <ScrollView>
            <Text>{JSON.stringify(nodeDef, null, 2)}</Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default DetailModal;
