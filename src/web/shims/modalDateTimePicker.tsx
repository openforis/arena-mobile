import { useEffect, useRef, useState } from "react";
import { Button, Dialog, Portal, TextInput } from "react-native-paper";

import { useTranslation } from "localization";

import { DateTimeInputFormat, DateTimeInputMode } from "./dateTimeInputFormat";

type Props = {
  date?: Date;
  isVisible?: boolean;
  mode?: DateTimeInputMode;
  onCancel: () => void;
  onConfirm: (date: Date) => void;
  [key: string]: any;
};

// Web replacement of react-native-modal-datetime-picker: dialog with a text input in the app formats
// (DD/MM/YYYY, 24h HH:mm); the HTML date/time inputs would follow the browser language instead
const DateTimePickerModal = (props: Props) => {
  const { date, isVisible = false, mode = "date", onCancel, onConfirm } = props;
  const { t } = useTranslation();
  const [dateInitial, setDateInitial] = useState(() => date ?? new Date());
  const [inputValue, setInputValue] = useState("");
  // date can be a new object on every render: read it only when the dialog opens
  const dateRef = useRef(date);
  dateRef.current = date;

  useEffect(() => {
    if (!isVisible) return;
    const dateNext = dateRef.current ?? new Date();
    setDateInitial(dateNext);
    setInputValue(DateTimeInputFormat.format(dateNext, mode));
  }, [isVisible, mode]);

  const dateSelected = DateTimeInputFormat.parse(inputValue, mode, dateInitial);
  const placeholder = DateTimeInputFormat.placeholderByMode[mode];

  const confirm = () => {
    if (dateSelected) onConfirm(dateSelected);
  };

  return (
    <Portal>
      <Dialog visible={isVisible} onDismiss={onCancel}>
        <Dialog.Content>
          <TextInput
            autoFocus
            error={inputValue.length > 0 && !dateSelected}
            inputMode="numeric"
            label={placeholder}
            mode="outlined"
            onChangeText={(text) =>
              setInputValue(DateTimeInputFormat.mask(text, mode))
            }
            onSubmitEditing={confirm}
            placeholder={placeholder}
            value={inputValue}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancel}>{t("common:cancel")}</Button>
          <Button disabled={!dateSelected} onPress={confirm}>
            {t("common:ok")}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default DateTimePickerModal;
