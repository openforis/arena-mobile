import React from "react";
import PropTypes from "prop-types";

import { DateFormats, Dates } from "@openforis/arena-core";

import { Text } from "components";
import { useAppInfo } from "hooks";

import styles from "./versionNumberInfoStyles";

const getLastUpdateTimeText = (lastUpdateTime) => {
  if (!lastUpdateTime) return "";
  const lastUpdateTimeFormatted = Dates.convertDate({
    dateStr: lastUpdateTime,
    formatFrom: DateFormats.datetimeStorage,
    formatTo: DateFormats.dateDisplay,
  });
  return ` (${lastUpdateTimeFormatted})`;
};

export const VersionNumberInfoText = (props) => {
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

VersionNumberInfoText.propTypes = {
  includeUpdateTime: PropTypes.bool,
};
