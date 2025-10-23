import { Portal, Modal as RNPModal } from "react-native-paper";
import PropTypes from "prop-types";

import { CloseIconButton } from "../CloseIconButton";
import { HView } from "../HView";
import { Text } from "../Text";
import { VView } from "../VView";

import styles from "./styles";

export const Modal = (props) => {
  const {
    children,
    onDismiss,
    showCloseButton = true,
    titleKey,
    titleParams,
  } = props;
  return (
    <Portal>
      <RNPModal visible onDismiss={onDismiss}>
        <VView style={styles.container}>
          <HView style={styles.header}>
            {titleKey && (
              <Text
                style={styles.headerText}
                textKey={titleKey}
                textParams={titleParams}
                variant="titleLarge"
              />
            )}
            {showCloseButton && <CloseIconButton onPress={onDismiss} />}
          </HView>
          {children}
        </VView>
      </RNPModal>
    </Portal>
  );
};

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  onDismiss: PropTypes.func.isRequired,
  showCloseButton: PropTypes.bool,
  titleKey: PropTypes.string,
  titleParams: PropTypes.object,
};
