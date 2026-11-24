import React from "react";

import { DateFormats, Dates } from "@openforis/arena-core";

import { Text } from "components";
import { useAppInfo } from "hooks";
import type { ArenaMobileAppInfo } from "utils/SystemUtils";

import styles from "./versionNumberInfoStyles";

const getLastUpdateTimeText = (
  lastUpdateTime: ArenaMobileAppInfo["lastUpdateTime"],
) => {
  if (!lastUpdateTime) return "";
  const lastUpdateTimeFormatted = Dates.convertDate({
    dateStr: lastUpdateTime,
    formatFrom: DateFormats.datetimeStorage,
    formatTo: DateFormats.dateDisplay,
  });
  return ` (${lastUpdateTimeFormatted})`;
};

type Props = {
  includeUpdateTime?: boolean;
};

export const VersionNumberInfoText = (props: Props) => {
  const { includeUpdateTime = true } = props;

  const appInfo = useAppInfo();
  const lastUpdateTimeText = getLastUpdateTimeText(appInfo.lastUpdateTime);

  return (
    <Text style={styles.appVersionName} variant="labelLarge">
      v{appInfo.version} [{appInfo.buildNumber}]
      {includeUpdateTime ? lastUpdateTimeText : ""}
    </Text>
  );
};
