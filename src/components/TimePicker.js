import React from "react";

import { DateFormats } from "@openforis/arena-core";

import { DateTimePicker } from "./DateTimePicker";

export const TimePicker = (props) => (
  <DateTimePicker {...props} format={DateFormats.timeStorage} mode="time" />
);

TimePicker.propTypes = DateTimePicker.propTypes;
