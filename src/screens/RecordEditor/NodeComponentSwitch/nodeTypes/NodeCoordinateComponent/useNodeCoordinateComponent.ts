import { useCallback, useMemo, useState } from "react";

import {
  ArenaNodeDefCoordinate,
  NodeDefs,
  Numbers,
  Objects,
  PointFactory,
  Points,
  ArenaSRSIndex,
  Surveys,
} from "@openforis/arena-core";

import { useAvailableGpsSources, useLocationWatch } from "hooks";
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
import {
  CoordinateUiValue,
  CoordinateValueWithExtraFields,
} from "./coordinateValueTypes";

const stringToNumber = (str: string | undefined) => Numbers.toNumber(str);
const numberToString = (
  num: number | string | null | undefined,
  roundToDecimals = Number.NaN,
) => {
  if (Objects.isEmpty(num)) return "";
  return String(Numbers.roundToPrecision(num, roundToDecimals));
};
const pointToUiValue = ({
  x,
  y,
  srs,
}: {
  x?: number | string;
  y?: number | string;
  srs: string;
}): CoordinateUiValue => ({
  x: numberToString(x),
  y: numberToString(y),
  srs,
});

const locationToUiValue = ({
  location,
  nodeDef,
  srsTo,
  srsIndex,
}: {
  location: LocationPoint;
  nodeDef: ArenaNodeDefCoordinate;
  srsTo: string;
  srsIndex?: ArenaSRSIndex;
}): CoordinateUiValue | null => {
  const { latitude, longitude, accuracy } = location;

  const pointLatLong = PointFactory.createInstance({
    x: longitude,
    y: latitude,
  });
  const point = Points.transform(pointLatLong, srsTo, srsIndex);
  if (!point) {
    return null;
  }
  const { x, y } = point;

  const includedExtraFields = NodeDefs.getCoordinateAdditionalFields(nodeDef);

  const result = pointToUiValue({
    x: Numbers.roundToPrecision(x, 6),
    y: Numbers.roundToPrecision(y, 6),
    srs: srsTo,
  });

  for (const field of includedExtraFields) {
    result[field] = numberToString(
      (location as Partial<Record<string, number | null>>)[field],
      2,
    );
  }
  // always include accuracy
  result.accuracy = numberToString(accuracy, 2);
  return result;
};

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
    (nodeValue: CoordinateValueWithExtraFields | null): CoordinateUiValue => {
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
    ): CoordinateValueWithExtraFields | null => {
      const { x, y, srs } = uiValue ?? {};

      if (Objects.isEmpty(x) && Objects.isEmpty(y)) return null;

      const result: CoordinateValueWithExtraFields = {
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
      nodeValueA: CoordinateValueWithExtraFields | null,
      nodeValueB: CoordinateValueWithExtraFields | null,
    ) => {
      const transformCoordinateValue = (
        coordVal: CoordinateValueWithExtraFields | null,
      ) => {
        if (!coordVal) return null;
        const coordValCleaned = Object.entries(coordVal).reduce(
          (acc, [key, value]) => {
            if (includedFields.has(key)) {
              acc[key] = nonNumericFields.has(key)
                ? value
                : Numbers.toNumber(value);
            }
            return acc;
          },
          {} as CoordinateValueWithExtraFields,
        );

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
    (fieldKey: string) => (val: string) => {
      const valueNext = { ...uiValue, [fieldKey]: val } as CoordinateUiValue;
      onValueChange({ value: valueNext });
    },
    [onValueChange, uiValue],
  );

  const locationCallback = useCallback(
    ({ location }: { location: LocationPoint | null }) => {
      if (!location) return;

      const valueNext = locationToUiValue({
        location,
        nodeDef,
        srsTo: srs,
        srsIndex,
      });
      onValueChange({ value: valueNext! });
    },
    [nodeDef, onValueChange, srs, srsIndex],
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
    await startLocationWatch();
  }, [confirm, startLocationWatch, uiValueX, uiValueY, updateNodeValue]);

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
    (location: LocationPoint) => {
      const valueNext = locationToUiValue({
        location,
        nodeDef,
        srsTo: srs,
        srsIndex,
      });
      onValueChange({ value: valueNext!, ignoreDelay: true });
    },
    [nodeDef, srs, srsIndex, onValueChange],
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
