import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import {
  CollapsiblePanel,
  FieldSet,
  FormItem,
  HView,
  Icon,
  Text,
} from "components";
import { GpsLockingEnabledWarning } from "appComponents/GpsLockingEnabledWarning";
import { useTranslation } from "localization";
import { BatteryState } from "model";
import { RecordFileService } from "service";
import {
  DeviceInfoSelectors,
  SettingsSelectors,
  SurveySelectors,
  useBatteryStateListener,
  useFreeDiskStorageMonitor,
} from "state";
import { useIsNetworkConnectedMonitor } from "state/deviceInfo/useIsNetworkConnectedMonitor";
import { Environment, Files, TimeUtils } from "utils";

import { BatteryIcon } from "./BatteryIcon";

import styles from "./styles";

const batteryStatusAvailable = !Environment.isIOS;

const getBatteryPercent = (batteryLevel) =>
  `${Math.round(batteryLevel * 100)}%`;

const StatusBarPanel = (props) => {
  const {
    batteryLevel,
    batteryState,
    batteryTimeToDischargeFormattedShort,
    batteryTimeToFullChargeFormattedShort,
    freeDiskStorageFormatted,
    isNetworkConnected,
  } = props;

  const { t } = useTranslation();

  const survey = SurveySelectors.useCurrentSurvey();
  const surveyId = survey.id;

  const [state, setState] = useState({
    recordFilesSize: "...",
    tempFilesSize: "...",
  });
  const { recordFilesSize, tempFilesSize } = state;

  useEffect(() => {
    const fetchInfo = async () => {
      const recordFilesSize = surveyId
        ? await RecordFileService.getRecordFilesDirectorySize({ surveyId })
        : null;
      const cacheSize = await Files.getDirSize(Files.getTempFolderParentUri());
      setState({
        recordFilesSize: recordFilesSize
          ? Files.toHumanReadableFileSize(recordFilesSize)
          : null,
        tempFilesSize: Files.toHumanReadableFileSize(cacheSize),
      });
    };
    fetchInfo();
  }, [surveyId]);

  return (
    <>
      {batteryStatusAvailable && (
        <FieldSet headerKey="device:battery.title">
          <FormItem labelKey="device:battery.level">
            {getBatteryPercent(batteryLevel)}
          </FormItem>
          {batteryState && (
            <FormItem labelKey="device:battery.statusLabel">
              {t(`device:battery.status.${batteryState}`)}
            </FormItem>
          )}
          {batteryTimeToDischargeFormattedShort && (
            <FormItem labelKey="device:battery.timeLeftToDischarge">
              {batteryTimeToDischargeFormattedShort}
            </FormItem>
          )}
          {batteryTimeToFullChargeFormattedShort && (
            <FormItem labelKey="device:battery.timeLeftToFullCharge">
              {batteryTimeToFullChargeFormattedShort}
            </FormItem>
          )}
        </FieldSet>
      )}
      <GpsLockingEnabledWarning />

      <FieldSet headerKey="device:network.title">
        <FormItem labelKey="device:network.statusLabel">
          {t(
            `device:network.status.${
              isNetworkConnected ? "connected" : "offline"
            }`
          )}
        </FormItem>
      </FieldSet>
      <FieldSet headerKey="device:internalMemory.title">
        <FormItem labelKey="device:internalMemory.storageAvailable">
          {freeDiskStorageFormatted}
        </FormItem>
        {recordFilesSize && (
          <FormItem labelKey="device:internalMemory.recordFilesSize">
            {recordFilesSize}
          </FormItem>
        )}
        {tempFilesSize > 0 && (
          <FormItem labelKey="device:internalMemory.tempFilesSize">
            {tempFilesSize}
          </FormItem>
        )}
      </FieldSet>
    </>
  );
};

StatusBarPanel.propTypes = {
  batteryLevel: PropTypes.number,
  batteryState: PropTypes.string,
  batteryTimeToDischargeFormattedShort: PropTypes.string,
  batteryTimeToFullChargeFormattedShort: PropTypes.string,
  freeDiskStorageFormatted: PropTypes.string,
  isNetworkConnected: PropTypes.bool,
};

export const StatusBar = () => {
  const { t } = useTranslation();

  const {
    batteryLevel,
    batteryState,
    batteryTimeToDischarge,
    batteryTimeToFullCharge,
    freeDiskStorage,
    isNetworkConnected,
  } = DeviceInfoSelectors.useDeviceInfo();

  useBatteryStateListener();
  useFreeDiskStorageMonitor();
  useIsNetworkConnectedMonitor();

  const settings = SettingsSelectors.useSettings();
  const { locationGpsLocked } = settings;

  const formatRemainingTimeCompact = (time) =>
    TimeUtils.formatRemainingTimeIfLessThan1Day({
      time,
      t,
      formatMode: TimeUtils.formatModes.compact,
    });

  const formatRemainingTimeShort = (time) =>
    TimeUtils.formatRemainingTimeIfLessThan1Day({
      time,
      t,
      formatMode: TimeUtils.formatModes.short,
    });

  const batteryTimeToDischargeFormatted = formatRemainingTimeCompact(
    batteryTimeToDischarge
  );
  const batteryTimeToDischargeFormattedShort = formatRemainingTimeShort(
    batteryTimeToDischarge
  );
  const batteryTimeToFullChargeFormattedShort = formatRemainingTimeShort(
    batteryTimeToFullCharge
  );
  const freeDiskStorageFormatted =
    Files.toHumanReadableFileSize(freeDiskStorage);

  return (
    <CollapsiblePanel
      headerContent={
        <HView style={styles.headerContent}>
          {batteryStatusAvailable && (
            <HView>
              <BatteryIcon
                batteryLevel={batteryLevel}
                batteryState={batteryState}
              />
              <Text variant="titleSmall">
                {getBatteryPercent(batteryLevel)}
              </Text>
              {batteryState === BatteryState.unplugged &&
                batteryTimeToDischargeFormatted && (
                  <Text variant="titleSmall">
                    {batteryTimeToDischargeFormatted}
                  </Text>
                )}
            </HView>
          )}
          {locationGpsLocked && <Icon source="crosshairs-gps" />}

          <Icon source={isNetworkConnected ? "web" : "cloud-off-outline"} />

          <HView>
            <Icon source="chart-pie" />
            <Text variant="titleSmall">
              {t("common:sizeAvailable", {
                size: freeDiskStorageFormatted,
              })}
            </Text>
          </HView>
        </HView>
      }
    >
      <StatusBarPanel
        batteryLevel={batteryLevel}
        batteryState={batteryState}
        batteryTimeToDischargeFormattedShort={
          batteryTimeToDischargeFormattedShort
        }
        batteryTimeToFullChargeFormattedShort={
          batteryTimeToFullChargeFormattedShort
        }
        freeDiskStorageFormatted={freeDiskStorageFormatted}
        isNetworkConnected={isNetworkConnected}
      />
    </CollapsiblePanel>
  );
};
