import React from "react";

import { DateFormats } from "@openforis/arena-core";

import { DateTimePicker } from "./DateTimePicker";

export const DatePicker = (props) => (
  <DateTimePicker {...props} format={DateFormats.dateDisplay} mode="date" />
);

DatePicker.propTypes = DateTimePicker.propTypes;
