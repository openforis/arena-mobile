import { useCallback } from "react";

import { DateFormats, Dates, Objects } from "@openforis/arena-core";

import { DateTimePicker } from "components";
import { log } from "utils";

import { useNodeComponentLocalState } from "../../useNodeComponentLocalState";

type NodeDateTimeComponentProps = {
  mode?: "date" | "time";
  nodeDef: any;
  nodeUuid?: string;
};

export const NodeDateTimeComponent = (props: NodeDateTimeComponentProps) => {
  const { mode, nodeDef, nodeUuid } = props;

  log.debug(`rendering NodeDateTimeComponent for ${nodeDef.props.name}`);
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
