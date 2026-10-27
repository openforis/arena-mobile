import React from "react";

import { DataVisualizerCellProps, Icon, Tooltip } from "components";

// records of other user groups: they can be viewed or cloned, but not edited or uploaded
export const RecordReadOnlyIcon = ({ item }: DataVisualizerCellProps) =>
  item.readOnly ? (
    <Tooltip titleKey="recordsList:readOnlyOfAnotherUserGroup">
      <Icon size={24} source="lock" />
    </Tooltip>
  ) : null;
