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
  onClose: () => void;
  style?: any;
  title: string;
};

export const Dialog = (props: DialogProps) => {
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
          {actions.map(({
            onPress,
            textKey
          }: any) => (
            <Button key={textKey} onPress={onPress} textKey={textKey} />
          ))}
          <Button onPress={onClose} textKey={closeButtonTextKey} />
        </RNPDialog.Actions>
      </RNPDialog>
    </Portal>
  );
};
