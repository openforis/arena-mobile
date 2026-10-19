import { createElement, useEffect, useRef, useState } from "react";
import { Button, Dialog, Portal, useTheme } from "react-native-paper";

import { useTranslation } from "localization";

type Mode = "date" | "time" | "datetime";

type Props = {
  date?: Date;
  isVisible?: boolean;
  mode?: Mode;
  onCancel: () => void;
  onConfirm: (date: Date) => void;
  [key: string]: any;
};

const pad = (value: number) => String(value).padStart(2, "0");

const toInputValue = (date: Date, mode: Mode): string => {
  const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (mode === "date") return datePart;
  if (mode === "time") return timePart;
  return `${datePart}T${timePart}`;
};

const fromInputValue = (
  value: string,
  mode: Mode,
  dateInitial: Date,
): Date | null => {
  const [datePart, timePart] =
    mode === "time" ? [null, value] : value.split("T");
  const result = new Date(dateInitial);
  if (datePart) {
    const [year, month, day] = datePart.split("-").map(Number);
    if (!year || !month || !day) return null;
    result.setFullYear(year, month - 1, day);
  }
  if (timePart) {
    const [hours, minutes] = timePart.split(":").map(Number);
    if (hours === undefined || minutes === undefined) return null;
    result.setHours(hours, minutes, 0, 0);
  }
  return result;
};

const inputTypeByMode: Record<Mode, string> = {
  date: "date",
  time: "time",
  datetime: "datetime-local",
};

// Web replacement of react-native-modal-datetime-picker: dialog with a native HTML date/time input
const DateTimePickerModal = (props: Props) => {
  const { date, isVisible = false, mode = "date", onCancel, onConfirm } = props;
  const theme = useTheme();
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
    setInputValue(toInputValue(dateNext, mode));
  }, [isVisible, mode]);

  const dateSelected = fromInputValue(inputValue, mode, dateInitial);

  return (
    <Portal>
      <Dialog visible={isVisible} onDismiss={onCancel}>
        <Dialog.Content>
          {createElement("input", {
            autoFocus: true,
            onChange: (e: any) => setInputValue(e.target.value),
            style: {
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.outline}`,
              borderRadius: 4,
              color: theme.colors.onSurface,
              colorScheme: theme.dark ? "dark" : "light",
              fontSize: 18,
              padding: 8,
            },
            type: inputTypeByMode[mode],
            value: inputValue,
          })}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancel}>{t("common:cancel")}</Button>
          <Button
            disabled={!dateSelected}
            onPress={() => dateSelected && onConfirm(dateSelected)}
          >
            {t("common:ok")}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default DateTimePickerModal;
