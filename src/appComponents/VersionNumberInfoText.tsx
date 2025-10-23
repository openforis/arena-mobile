import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { DateFormats, Dates } from "@openforis/arena-core";

import { Text } from "components";
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
  // @ts-expect-error TS(2339): Property 'lastUpdateTime' does not exist on type '... Remove this comment to see the full error message
  const lastUpdateTimeText = getLastUpdateTimeText(appInfo.lastUpdateTime);

  return (
    <Text style={styles.appVersionName} variant="labelLarge">
      // @ts-expect-error TS(2339): Property 'version' does not exist on type '{}'.
      v{appInfo.version} [{appInfo.buildNumber}]
      {includeUpdateTime ? lastUpdateTimeText : ""}
    </Text>
  );
};

VersionNumberInfoText.propTypes = {
  includeUpdateTime: PropTypes.bool,
};
