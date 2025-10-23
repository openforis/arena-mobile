import { useCallback } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { DateFormats, Dates, Objects } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { DateTimePicker } from "components";

import { useNodeComponentLocalState } from "../../useNodeComponentLocalState";
import { NodeComponentPropTypes } from "./nodeComponentPropTypes";

export const NodeDateTimeComponent = (props: any) => {
  const { mode, nodeDef, nodeUuid } = props;

  if (__DEV__) {
    console.log(`rendering NodeDateTimeComponent for ${nodeDef.props.name}`);
  }
  const formatDisplay =
    mode === "date" ? DateFormats.dateDisplay : DateFormats.timeStorage;
  const formatStorage =
    mode === "date" ? DateFormats.dateStorage : DateFormats.timeStorage;

  const { value, updateNodeValue } = useNodeComponentLocalState({ nodeUuid });

  const onChange = useCallback(
    (date: any) => {
      const dateNodeValue = Dates.format(date, formatStorage);
      updateNodeValue({ value: dateNodeValue });
    },
    [formatStorage, updateNodeValue]
  );

  const editable = !nodeDef.props.readOnly;

  const dateValue = Objects.isEmpty(value)
    ? null
    : Dates.parse(value, formatStorage, { keepTimeZone: false });

  return (
    <DateTimePicker
      editable={editable}
      format={formatDisplay}
      mode={mode}
      onChange={onChange}
      value={dateValue}
    />
  );
};

NodeDateTimeComponent.propTypes = {
  ...NodeComponentPropTypes,
  mode: PropTypes.oneOf(["date", "time"]),
};
