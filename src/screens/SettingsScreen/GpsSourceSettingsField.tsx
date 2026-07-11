import { useCallback, useMemo } from "react";

import { Dropdown } from "components";
import { useAvailableGpsSources } from "hooks";
import { GpsSourceSetting, SettingsModel } from "model";
import { ExternalGpsService } from "service/externalGps/ExternalGpsService";
import { SettingsActions, useAppDispatch } from "state";

type GpsSourceOption = { key: string; label: string };

/**
 * Custom (non-generic-schema) settings field for choosing the preferred GPS
 * source. Not driven by SettingsModel.properties like language/theme because the
 * option list is dynamic (depends on which external GPS devices are currently
 * bonded), unlike those static dropdowns.
 */
export const GpsSourceSettingsField = (props: { value: string }) => {
  const { value } = props;
  const dispatch = useAppDispatch();
  const { availableGpsSources } = useAvailableGpsSources();

  const items = useMemo<GpsSourceOption[]>(
    () => [
      { key: GpsSourceSetting.auto, label: "settings:preferredGpsSourceId.auto" },
      ...availableGpsSources.map((source) => ({
        key: source.id,
        label:
          source.id === ExternalGpsService.internalGpsSourceId
            ? "settings:preferredGpsSourceId.internal"
            : source.label,
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

  return (
    <Dropdown
      items={items}
      itemKeyExtractor={(item: GpsSourceOption) => item.key}
      itemLabelExtractor={(item: GpsSourceOption) => item.label}
      label="settings:preferredGpsSourceId.label"
      onChange={onChange}
      value={value}
    />
  );
};
