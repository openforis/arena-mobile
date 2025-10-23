import { Dialog as RNPDialog, Portal } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useTranslation } from "localization";
import { Button } from "../Button";

export const Dialog = (props: any) => {
  const {
    actions = [],
    children,
    closeButtonTextKey = "common:close",
    onClose,
    style,
    title,
  } = props;

  const { t } = useTranslation();
  return (
    // @ts-expect-error TS(2749): 'Portal' refers to a value, but is being used as a... Remove this comment to see the full error message
    <Portal>
      // @ts-expect-error TS(7027): Unreachable code detected.
      <RNPDialog onDismiss={onClose} style={style} visible>
        // @ts-expect-error TS(2503): Cannot find namespace 'RNPDialog'.
        <RNPDialog.Title>{t(title: any)}</RNPDialog.Title>
        <RNPDialog.Content>{children}</RNPDialog.Content>
        <RNPDialog.Actions>
          {actions.map(({
            onPress,
            textKey
          }: any) => (
            // @ts-expect-error TS(2709): Cannot use namespace 'Button' as a type.
            <Button key={textKey} onPress={onPress} textKey={textKey} />
          ))}
          // @ts-expect-error TS(2304): Cannot find name 'onPress'.
          <Button onPress={onClose} textKey={closeButtonTextKey} />
        </RNPDialog.Actions>
      </RNPDialog>
    </Portal>
  );
};

Dialog.propTypes = {
  children: PropTypes.node,
  actions: PropTypes.array,
  closeButtonTextKey: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  style: PropTypes.object,
  title: PropTypes.string.isRequired,
};
