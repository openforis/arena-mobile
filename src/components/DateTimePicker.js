import React, { useCallback, useState } from "react";
import { Pressable } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { TextInput as RNPTextInput } from "react-native-paper";
import PropTypes from "prop-types";

import { Dates } from "@openforis/arena-core";

import { useConfirm } from "state/confirm";

import { HView } from "./HView";
import { IconButton } from "./IconButton";
import { TextInput } from "./TextInput";

export const DateTimePicker = (props) => {
  const {
    editable = true,
    format,
    mode,
    onChange: onChangeProp,
    value,
  } = props;

  const confirm = useConfirm();

  const [pickerShown, setPickerShown] = useState(false);

  const showPicker = useCallback(() => {
    setPickerShown(true);
  }, []);

  const hidePicker = useCallback(() => {
    setPickerShown(false);
  }, []);

  const onConfirm = useCallback(
    (selectedDate) => {
      hidePicker();
      onChangeProp(selectedDate);
    },
    [hidePicker, onChangeProp]
  );

  const onClear = useCallback(
    async (event) => {
      event.stopPropagation();
      if (await confirm({ messageKey: "common:confirmClearSelectedValue" })) {
        hidePicker();
        onChangeProp(null);
      }
    },
    [confirm, hidePicker, onChangeProp]
  );

  const icon = mode === "date" ? "calendar" : "clock";
  const textInputStyle = { width: mode === "date" ? 170 : 120 };

  return (
    <HView>
      <Pressable onPress={editable ? showPicker : undefined}>
        <TextInput
          editable={false}
          nonEditableStyleVisible={false}
          onPressIn={showPicker}
          right={
            editable && value ? (
              <RNPTextInput.Icon icon="close" onPress={onClear} />
            ) : undefined
          }
          style={textInputStyle}
          value={Dates.format(value, format)}
        />
      </Pressable>
      <IconButton disabled={!editable} icon={icon} onPress={showPicker} />
      <DateTimePickerModal
        is24Hour={true}
        isVisible={pickerShown}
        mode={mode}
        onConfirm={onConfirm}
        onCancel={hidePicker}
        date={value || new Date()}
      />
    </HView>
  );
};

DateTimePicker.propTypes = {
  editable: PropTypes.bool,
  format: PropTypes.string.isRequired,
  mode: PropTypes.oneOf(["date", "time"]),
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
};
