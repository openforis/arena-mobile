import { useCallback, useMemo, useState } from "react";
import { StyleSheet } from "react-native";

import {
  Button,
  Dropdown,
  GpsDevicePairingModal,
  HView,
  VView,
} from "components";
import { useAvailableGpsSources } from "hooks";
import { GpsSourceSetting, SettingsModel } from "model";
import { ExternalGpsService } from "service/externalGps/ExternalGpsService";
import { GpsSourceDescriptor } from "service/externalGps/types";
import { SettingsActions, useAppDispatch } from "state";
import { Environment } from "utils";

type GpsSourceOption = {
  key: string;
  label: string;
  labelIsI18nKey?: boolean;
};

const styles = StyleSheet.create({
  dropdownWrapper: { gap: 10 },
  pairNewDeviceButton: { alignSelf: "center" },
});

/**
 * Custom (non-generic-schema) settings field for choosing the preferred GPS
 * source. Not driven by SettingsModel.properties like language/theme because the
 * option list is dynamic (depends on which external GPS devices are currently
 * bonded), unlike those static dropdowns.
 */
export const GpsSourceSettingsField = (props: { value: string }) => {
  const { value } = props;
  const dispatch = useAppDispatch();
  const { availableGpsSources, refreshAvailableGpsSources } =
    useAvailableGpsSources();

  const [pairingModalVisible, setPairingModalVisible] = useState(false);

  const items = useMemo<GpsSourceOption[]>(
    () => [
      {
        key: GpsSourceSetting.auto,
        label: "settings:preferredGpsSourceId.auto",
      },
      ...availableGpsSources.map((source) => ({
        key: source.id,
        label:
          source.id === ExternalGpsService.internalGpsSourceId
            ? "settings:preferredGpsSourceId.internal"
            : source.label,
        labelIsI18nKey: source.id === ExternalGpsService.internalGpsSourceId,
      })),
    ],
    [availableGpsSources],
  );

  const onChange = useCallback(
    async (nextValue: string) => {
      dispatch(
        SettingsActions.updateSetting({
          key: SettingsModel.SettingKey.preferredGpsSourceId,
          value: nextValue,
        }),
      );
    },
    [dispatch],
  );

  const onDevicePaired = useCallback(
    async (source: GpsSourceDescriptor) => {
      await refreshAvailableGpsSources();
      await onChange(source.id);
      setPairingModalVisible(false);
    },
    [onChange, refreshAvailableGpsSources],
  );

  return (
    <HView>
      <VView fullFlex style={styles.dropdownWrapper}>
        <Dropdown
          items={items}
          itemKeyExtractor={(item: GpsSourceOption) => item.key}
          itemLabelExtractor={(item: GpsSourceOption) => item.label}
          label="settings:preferredGpsSourceId.label"
          onChange={onChange}
          value={value}
        />
        {Environment.isAndroid && (
          <Button
            icon="bluetooth-connect"
            onPress={() => setPairingModalVisible(true)}
            style={styles.pairNewDeviceButton}
            textKey="settings:preferredGpsSourceId.pairNewDevice"
          />
        )}
      </VView>
      {pairingModalVisible && (
        <GpsDevicePairingModal
          onDevicePaired={onDevicePaired}
          onDismiss={() => setPairingModalVisible(false)}
        />
      )}
    </HView>
  );
};
