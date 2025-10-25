import React from "react";

import { DateFormats } from "@openforis/arena-core";

import { DateTimePicker } from "./DateTimePicker";

type Props = {
  editable?: boolean;
  onChange: (date: Date | null) => void;
  value?: any;
};

export const TimePicker = (props: Props) => <DateTimePicker {...props} format={DateFormats.timeStorage} mode="time" />;
