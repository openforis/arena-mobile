import { Dialog as RNPDialog, Portal } from "react-native-paper";

import { useTranslation } from "localization";
import { Button } from "../Button";

type DialogAction = {
  onPress: () => void;
  textKey: string;
};

type DialogProps = {
  children?: React.ReactNode;
  actions?: DialogAction[];
  closeButtonTextKey?: string;
  dismissable?: boolean;
  onClose?: () => void;
  showActions?: boolean;
  showCloseButton?: boolean;
  style?: any;
  title: string;
  visible?: boolean;
};

export const Dialog = (props: DialogProps) => {
  const {
    actions = [],
    children,
    closeButtonTextKey = "common:close",
    dismissable: dismissableProp = true,
    onClose,
    showActions = true,
    showCloseButton: showCloseButtonProp = true,
    style,
    title,
    visible = true,
  } = props;

  const { t } = useTranslation();
  const handleClose = onClose || (() => undefined);
  const dismissable = dismissableProp && !!onClose;
  const showCloseButton = showCloseButtonProp && !!onClose;

  return (
    <Portal>
      <RNPDialog
        dismissable={dismissable}
        onDismiss={handleClose}
        style={style}
        visible={visible}
      >
        <RNPDialog.Title>{t(title)}</RNPDialog.Title>
        <RNPDialog.Content>{children}</RNPDialog.Content>
        {showActions && (
          <RNPDialog.Actions>
            {actions.map(({ onPress, textKey }: any) => (
              <Button key={textKey} onPress={onPress} textKey={textKey} />
            ))}
            {showCloseButton && (
              <Button onPress={handleClose} textKey={closeButtonTextKey} />
            )}
          </RNPDialog.Actions>
        )}
      </RNPDialog>
    </Portal>
  );
};
