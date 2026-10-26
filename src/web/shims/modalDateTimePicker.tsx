import { useEffect, useRef, useState } from "react";

import { Button } from "components/Button";
import { Dialog } from "components/Dialog";
import { TextInput } from "components/TextInput";

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
    <Dialog
      actionsContent={
        <>
          <Button onPress={onCancel} textKey="common:cancel" />
          <Button
            disabled={!dateSelected}
            onPress={confirm}
            textKey="common:ok"
          />
        </>
      }
      onClose={onCancel}
      showCloseButton={false}
      visible={isVisible}
    >
      <TextInput
        autoFocus
        error={inputValue.length > 0 && !dateSelected}
        inputMode="numeric"
        label={placeholder}
        labelIsI18nKey={false}
        onChange={(text) => setInputValue(DateTimeInputFormat.mask(text, mode))}
        onSubmitEditing={confirm}
        placeholder={placeholder}
        value={inputValue}
      />
    </Dialog>
  );
};

export default DateTimePickerModal;
