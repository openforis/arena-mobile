import React, {useCallback, useState} from 'react';
import {View} from 'react-native';

import Icon from 'arena-mobile-ui/components/Icon';
import Pressable from 'arena-mobile-ui/components/Pressable';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';

import DetailModal from './DetailModal';
import styles, {customStyles as CUSTOM_STYLES} from './styles';

const Label = ({
  nodeDef,
  customStyles = CUSTOM_STYLES,
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
      <Pressable style={styles.container} onLongPress={toggleModal} hitSlop={0}>
        {nodeDef?.props?.key && (
          <>
            <Icon name="key-variant" size="xs" color={iconColor} />
            <View style={styles.separator} />
          </>
        )}
        <TextBase
          size="l"
          customStyle={[styles.textStyle, customStyles.textStyle || {}]}
          numberOfLines={numberOfLines}>
          {label}
        </TextBase>
      </Pressable>
      <DetailModal
        nodeDef={nodeDef}
        isModalVisible={isDetailModalOpen}
        toggleModal={toggleModal}
      />
    </>
  );
};

export default React.memo(Label, (prevProps, nextProps) => {
  return prevProps.nodeDef.uuid === nextProps.nodeDef.uuid;
});
