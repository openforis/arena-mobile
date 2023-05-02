import React, {useCallback, useState} from 'react';
import {View, TouchableOpacity} from 'react-native';

import Icon from 'arena-mobile-ui/components/Icon';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import baseStyles from 'arena-mobile-ui/styles';

import DetailModal from './DetailModal';
import styles from './styles';

const Label = ({
  nodeDef,
  customStyles = {},
  iconColor = null,
  numberOfLines = 0,
}) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const label = useNodeDefNameOrLabel({nodeDef});

  const toggleModal = useCallback(() => {
    if (__DEV__) {
      setIsDetailModalOpen(prevValue => !prevValue);
    }
  }, []);

  return (
    <>
      <TouchableOpacity style={styles.container} onLongPress={toggleModal}>
        {nodeDef?.props?.key && (
          <>
            <Icon
              name="key-variant"
              size={baseStyles.bases.BASE_3}
              color={iconColor}
            />
            <View style={styles.separator} />
          </>
        )}
        <TextBase
          size="l"
          customStyle={[styles.textStyle, customStyles.textStyle || {}]}
          numberOfLines={numberOfLines}>
          {label}
        </TextBase>
      </TouchableOpacity>
      <DetailModal
        nodeDef={nodeDef}
        isModalVisible={isDetailModalOpen}
        toggleModal={toggleModal}
      />
    </>
  );
};

export default Label;
