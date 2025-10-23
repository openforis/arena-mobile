import { Portal, Modal as RNPModal } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { CloseIconButton } from "../CloseIconButton";
import { HView } from "../HView";
import { Text } from "../Text";
import { VView } from "../VView";

import styles from "./styles";

export const Modal = (props: any) => {
  const {
    children,
    onDismiss,
    showCloseButton = true,
    titleKey,
    titleParams,
  } = props;
  return (
    // @ts-expect-error TS(2749): 'Portal' refers to a value, but is being used as a... Remove this comment to see the full error message
    <Portal>
      // @ts-expect-error TS(7027): Unreachable code detected.
      <RNPModal visible onDismiss={onDismiss}>
        // @ts-expect-error TS(2709): Cannot use namespace 'VView' as a type.
        <VView style={styles.container}>
          // @ts-expect-error TS(2709): Cannot use namespace 'HView' as a type.
          <HView style={styles.header}>
            {titleKey && (
              <Text
                // @ts-expect-error TS(2552): Cannot find name 'style'. Did you mean 'styles'?
                style={styles.headerText}
                // @ts-expect-error TS(2304): Cannot find name 'textKey'.
                textKey={titleKey}
                // @ts-expect-error TS(2304): Cannot find name 'textParams'.
                textParams={titleParams}
                // @ts-expect-error TS(2304): Cannot find name 'variant'.
                variant="titleLarge"
              />
            )}
            // @ts-expect-error TS(2304): Cannot find name 'showCloseButton'.
            {showCloseButton && <CloseIconButton onPress={onDismiss} />}
          </HView>
          // @ts-expect-error TS(2304): Cannot find name 'children'.
          {children}
        // @ts-expect-error TS(2365): Operator '<' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
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
