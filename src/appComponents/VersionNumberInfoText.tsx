import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { DateFormats, Dates } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Text } from "components";
// @ts-expect-error TS(2307): Cannot find module 'hooks' or its corresponding ty... Remove this comment to see the full error message
import { useAppInfo } from "hooks";

import styles from "./versionNumberInfoStyles";

const getLastUpdateTimeText = (lastUpdateTime: any) => {
  if (!lastUpdateTime) return "";
  const lastUpdateTimeFormatted = Dates.convertDate({
    dateStr: lastUpdateTime,
    formatFrom: DateFormats.datetimeStorage,
    formatTo: DateFormats.dateDisplay,
  });
  return ` (${lastUpdateTimeFormatted})`;
};

export const VersionNumberInfoText = (props: any) => {
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
