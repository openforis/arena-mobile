import { Dialog as RNPDialog, Portal } from "react-native-paper";
import PropTypes from "prop-types";

import { useTranslation } from "localization";
import { Button } from "../Button";

export const Dialog = (props) => {
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
    <Portal>
      <RNPDialog onDismiss={onClose} style={style} visible>
        <RNPDialog.Title>{t(title)}</RNPDialog.Title>
        <RNPDialog.Content>{children}</RNPDialog.Content>
        <RNPDialog.Actions>
          {actions.map(({ onPress, textKey }) => (
            <Button key={textKey} onPress={onPress} textKey={textKey} />
          ))}
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
