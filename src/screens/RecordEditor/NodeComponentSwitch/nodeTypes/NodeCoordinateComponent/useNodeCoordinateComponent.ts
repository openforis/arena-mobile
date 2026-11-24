import { useCallback, useMemo, useState } from "react";

import {
  ArenaNodeDefCoordinate,
  ArenaRecordNodeValueCoordinate,
  NodeDefs,
  Numbers,
  Objects,
  Surveys,
} from "@openforis/arena-core";

import { useAvailableGpsSources, useLocationWatch, useToast } from "hooks";
import { LocationPoint, SettingsModel } from "model";
import { GpsSourceDescriptor } from "service/externalGps/types";
import {
  DataEntryActions,
  SettingsActions,
  SettingsSelectors,
  SurveySelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { log } from "utils";
import { useNodeComponentLocalState } from "../../../useNodeComponentLocalState";
import { useCoordinateDistanceTarget } from "./useCoordinateDistanceTarget";
import { NodeComponentProps } from "../nodeComponentPropTypes";
import { CoordinateUiField, CoordinateUiValue } from "./coordinateValueTypes";
import {
  locationToUiValue,
  numberToString,
  pointToUiValue,
  stringToNumber,
} from "./coordinateUiValueUtils";
import { createOncePerKeyNotifier } from "./oncePerKeyNotifier";

const nonNumericFields = new Set(["srs"]);

export const useNodeCoordinateComponent = (
  props: Pick<
    NodeComponentProps<ArenaNodeDefCoordinate>,
    "nodeDef" | "nodeUuid"
  >,
) => {
  const { nodeDef, nodeUuid } = props;

  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const toaster = useToast();
  const [conversionWarningNotifier] = useState(createOncePerKeyNotifier);
  const survey = SurveySelectors.useCurrentSurvey()!;
  const srsIndex = SurveySelectors.useCurrentSurveySrsIndex();
  const srss = useMemo(() => Surveys.getSRSs(survey), [survey]);
  const singleSrs = srss.length === 1;
  const defaultSrsCode = srss[0]!.code;
  const includedExtraFields = useMemo(
    () => NodeDefs.getCoordinateAdditionalFields(nodeDef),
    [nodeDef],
  );
  const includedFields = useMemo(
    () => new Set(["x", "y", "srs", ...includedExtraFields]),
    [includedExtraFields],
  );

  const [state, setState] = useState({
    compassNavigatorVisible: false,
  });

  const { compassNavigatorVisible } = state;

  const nodeValueToUiValue = useCallback(
    (nodeValue: ArenaRecordNodeValueCoordinate | null): CoordinateUiValue => {
      const { x, y, srs = defaultSrsCode } = nodeValue ?? {};

      const result = pointToUiValue({ x, y, srs });
      for (const fieldKey of includedExtraFields) {
        result[fieldKey] = numberToString(nodeValue?.[fieldKey]);
      }
      return result;
    },
    [includedExtraFields, defaultSrsCode],
  );

  const uiValueToNodeValue = useCallback(
    (
      uiValue: CoordinateUiValue | null,
    ): ArenaRecordNodeValueCoordinate | null => {
      const { x, y, srs } = uiValue ?? {};

      if (Objects.isEmpty(x) && Objects.isEmpty(y)) return null;

      const result: ArenaRecordNodeValueCoordinate = {
        x: stringToNumber(x),
        y: stringToNumber(y),
        srs: srs!,
      };
      for (const fieldKey of includedExtraFields) {
        result[fieldKey] = stringToNumber(uiValue?.[fieldKey]);
      }
      return result;
    },
    [includedExtraFields],
  );

  const isNodeValueEqual = useCallback(
    (
      nodeValueA: ArenaRecordNodeValueCoordinate | null,
      nodeValueB: ArenaRecordNodeValueCoordinate | null,
    ) => {
      const transformCoordinateValue = (
        coordVal: ArenaRecordNodeValueCoordinate | null,
      ) => {
        if (!coordVal) return null;
        const coordValCleaned = Object.entries(coordVal).reduce<
          Record<string, unknown>
        >((acc, [key, value]) => {
          if (includedFields.has(key)) {
            acc[key] = nonNumericFields.has(key)
              ? value
              : Numbers.toNumber(value);
          }
          return acc;
        }, {});

        if (!coordValCleaned.srs) {
          coordValCleaned.srs = defaultSrsCode;
        }
        return coordValCleaned;
      };
      const coordValA = transformCoordinateValue(nodeValueA);
      const coordValB = transformCoordinateValue(nodeValueB);
      return (
        Objects.isEqual(coordValA, coordValB) ||
        JSON.stringify(coordValA) === JSON.stringify(coordValB) ||
        (Objects.isEmpty(coordValA) && Objects.isEmpty(coordValB))
      );
    },
    [defaultSrsCode, includedFields],
  );

  const { applicable, uiValue, updateNodeValue, onClearPress } =
    useNodeComponentLocalState({
      nodeUuid,
      updateDelay: 500,
      nodeValueToUiValue,
      uiValueToNodeValue,
      isNodeValueEqual,
    });

  const {
    accuracy,
    srs = defaultSrsCode,
    x: uiValueX,
    y: uiValueY,
  } = uiValue ?? {};

  const onValueChange = useCallback(
    ({
      value: valueNext,
      ignoreDelay = false,
    }: {
      value: CoordinateUiValue;
      ignoreDelay?: boolean;
    }) => {
      if (!valueNext.srs && singleSrs) {
        // set default SRS
        valueNext.srs = defaultSrsCode;
      }
      updateNodeValue({ value: valueNext, ignoreDelay });
    },
    [defaultSrsCode, singleSrs, updateNodeValue],
  );

  const onChangeValueField = useCallback(
    (fieldKey: CoordinateUiField) => (val: string) => {
      const valueNext = { ...uiValue, [fieldKey]: val } as CoordinateUiValue;
      onValueChange({ value: valueNext });
    },
    [onValueChange, uiValue],
  );

  const applyLocation = useCallback(
    ({
      location,
      ignoreDelay = false,
      throttleWarning = false,
    }: {
      location: LocationPoint;
      ignoreDelay?: boolean;
      throttleWarning?: boolean;
    }) => {
      const valueNext = locationToUiValue({
        location,
        nodeDef,
        srsTo: srs,
        srsIndex,
      });
      if (!valueNext) {
        // the location cannot be converted to the selected SRS: keep the current value
        log.warn(`cannot convert location to SRS ${srs}`);
        if (!throttleWarning || conversionWarningNotifier.shouldNotify(srs)) {
          toaster("dataEntry:coordinate.locationCannotBeConvertedToSrs", {
            srs,
          });
        }
        return;
      }
      onValueChange({ value: valueNext, ignoreDelay });
    },
    [conversionWarningNotifier, nodeDef, onValueChange, srs, srsIndex, toaster],
  );

  const locationCallback = useCallback(
    ({ location }: { location: LocationPoint | null }) => {
      if (!location) return;
      // watch readings arrive continuously: warn once per watch and SRS
      applyLocation({ location, throttleWarning: true });
    },
    [applyLocation],
  );

  const {
    activeLocationSourceId,
    cancelConnecting,
    connectingSourceId,
    locationAccuracyThreshold,
    locationSourceUnavailable,
    locationWatchElapsedTime,
    locationWatchProgress,
    locationWatchStatus,
    locationWatchTimeout,
    startLocationWatch,
    stopLocationWatch,
    watchingLocation,
  } = useLocationWatch({ locationCallback });

  const preferredGpsSourceId = SettingsSelectors.usePreferredGpsSourceId();
  const {
    availableGpsSources,
    loading: gpsSourcesLoading,
    refreshAvailableGpsSources,
  } = useAvailableGpsSources();

  const onSelectGpsSource = useCallback(
    (sourceId: string) => {
      dispatch(
        SettingsActions.updateSetting({
          key: SettingsModel.SettingKey.preferredGpsSourceId,
          value: sourceId,
        }),
      );
    },
    [dispatch],
  );

  const onGpsDevicePaired = useCallback(
    async (source: GpsSourceDescriptor) => {
      await refreshAvailableGpsSources();
      onSelectGpsSource(source.id);
    },
    [onSelectGpsSource, refreshAvailableGpsSources],
  );

  const distanceTarget = useCoordinateDistanceTarget({
    nodeDef,
    nodeUuid: nodeUuid!,
  });

  const onChangeSrs = useCallback(
    (srsTo: string) => {
      dispatch(DataEntryActions.updateCoordinateValueSrs({ nodeUuid, srsTo }));
    },
    [dispatch, nodeUuid],
  );

  const onStartGpsPress = useCallback(async () => {
    log.debug("onStartGpsPress");
    const valueExists =
      Objects.isNotEmpty(uiValueX) && Objects.isNotEmpty(uiValueY);
    if (valueExists) {
      if (
        await confirm({ messageKey: "dataEntry:confirmOverwriteValue.message" })
      ) {
        // clear existing value before starting GPS
        log.debug("Clearing existing coordinate value before starting GPS");
        updateNodeValue({ value: null, ignoreDelay: true });
      } else {
        // value exists and user did not confirm overwrite; do not start GPS
        return;
      }
    }
    conversionWarningNotifier.reset();
    await startLocationWatch();
  }, [
    confirm,
    conversionWarningNotifier,
    startLocationWatch,
    uiValueX,
    uiValueY,
    updateNodeValue,
  ]);

  const onStopGpsPress = useCallback(() => {
    stopLocationWatch();
  }, [stopLocationWatch]);

  const onCancelGpsConnectPress = useCallback(() => {
    cancelConnecting();
  }, [cancelConnecting]);

  const setCompassNavigatorVisible = useCallback(
    (visible: boolean) =>
      setState((statePrev) => ({
        ...statePrev,
        compassNavigatorVisible: visible,
      })),
    [],
  );

  const showCompassNavigator = useCallback(
    () => setCompassNavigatorVisible(true),
    [setCompassNavigatorVisible],
  );
  const hideCompassNavigator = useCallback(
    () => setCompassNavigatorVisible(false),
    [setCompassNavigatorVisible],
  );

  const onCompassNavigatorUseCurrentLocation = useCallback(
    (location: LocationPoint) => applyLocation({ location, ignoreDelay: true }),
    [applyLocation],
  );

  const editable = !NodeDefs.isReadOnly(nodeDef);
  const inputFieldsEditable =
    editable && !NodeDefs.isAllowOnlyDeviceCoordinate(nodeDef);

  const deleteButtonVisible =
    // visible also for required attributes: a wrong coordinate must be clearable
    editable &&
    uiValue &&
    (Objects.isNotEmpty(uiValue.x) || Objects.isNotEmpty(uiValue.y));

  return {
    accuracy,
    activeLocationSourceId,
    applicable,
    availableGpsSources,
    compassNavigatorVisible,
    connectingSourceId,
    deleteButtonVisible,
    distanceTarget,
    editable,
    gpsSourcesLoading,
    hideCompassNavigator,
    includedExtraFields,
    inputFieldsEditable,
    locationAccuracyThreshold,
    locationSourceUnavailable,
    locationWatchElapsedTime,
    locationWatchProgress,
    locationWatchStatus,
    locationWatchTimeout,
    onCancelGpsConnectPress,
    onChangeSrs,
    onChangeValueField,
    onClearPress,
    onCompassNavigatorUseCurrentLocation,
    onGpsDevicePaired,
    onSelectGpsSource,
    onStartGpsPress,
    onStopGpsPress,
    preferredGpsSourceId,
    showCompassNavigator,
    srs,
    srsIndex,
    uiValue,
    watchingLocation,
  };
};
