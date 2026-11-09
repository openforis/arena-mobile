import React from "react";

import { DataVisualizerCellProps, Icon, Tooltip } from "components";
import { RemoteConnectionSelectors } from "state";

// records of other user groups (they can be viewed or cloned, but not edited or uploaded)
// or of a survey where the user role cannot edit records (e.g. survey guest)
export const RecordReadOnlyIcon = ({ item }: DataVisualizerCellProps) => {
  const canCreateRecords =
    RemoteConnectionSelectors.useLoggedInUserCanCreateRecords();
  if (!item.readOnly) return null;
  return (
    <Tooltip
      titleKey={
        canCreateRecords
          ? "recordsList:readOnlyOfAnotherUserGroup"
          : "recordsList:readOnlyRole"
      }
    >
      <Icon size={24} source="lock" />
    </Tooltip>
  );
};
