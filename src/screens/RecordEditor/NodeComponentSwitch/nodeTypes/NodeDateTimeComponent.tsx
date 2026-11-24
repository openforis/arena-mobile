import { useCallback } from "react";

import {
  DateFormats,
  Dates,
  ArenaNodeDefDate,
  NodeDefs,
  ArenaNodeDefTime,
  Objects,
} from "@openforis/arena-core";

import { DateTimePicker } from "components";
import { log } from "utils";

import { useNodeComponentLocalState } from "../../useNodeComponentLocalState";
import { NodeComponentProps } from "./nodeComponentPropTypes";

type NodeDateTimeComponentProps = NodeComponentProps<
  ArenaNodeDefDate | ArenaNodeDefTime
> & {
  mode?: "date" | "time";
};

export const NodeDateTimeComponent = (props: NodeDateTimeComponentProps) => {
  const { mode, nodeDef, nodeUuid } = props;

  log.debug(`rendering NodeDateTimeComponent for ${NodeDefs.getName(nodeDef)}`);
  const formatDisplay =
    mode === "date" ? DateFormats.dateDisplay : DateFormats.timeStorage;
  const formatStorage =
    mode === "date" ? DateFormats.dateStorage : DateFormats.timeStorage;

  const { value, updateNodeValue } = useNodeComponentLocalState<string>({
    nodeUuid,
  });

  const onChange = useCallback(
    (date: Date | null) => {
      const dateNodeValue = Dates.format(date as Date, formatStorage);
      updateNodeValue({ value: dateNodeValue });
    },
    [formatStorage, updateNodeValue],
  );

  const editable = !NodeDefs.isReadOnly(nodeDef);

  const dateValue = Objects.isEmpty(value)
    ? null
    : Dates.parse(value!, formatStorage, { keepTimeZone: false });

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
