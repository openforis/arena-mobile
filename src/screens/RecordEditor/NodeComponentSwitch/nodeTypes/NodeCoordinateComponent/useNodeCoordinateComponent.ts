import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
  NodeDefs,
  NodeValueCoordinate,
  Numbers,
  Objects,
  PointFactory,
  Points,
  Records,
  SRSIndex,
  Surveys,
} from "@openforis/arena-core";

import { useLocationWatch } from "hooks";
import { LocationPoint } from "model";
import { RecordNodes } from "model/utils/RecordNodes";
import {
  DataEntryActions,
  DataEntrySelectors,
  SurveySelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { log } from "utils";
import { useNodeComponentLocalState } from "../../../useNodeComponentLocalState";

const stringToNumber = (str: any) => Numbers.toNumber(str);
const numberToString = (num: any, roundToDecimals = Number.NaN) => {
  if (Objects.isEmpty(num)) return "";
  return String(Numbers.roundToPrecision(num, roundToDecimals));
};
const pointToUiValue = ({ x, y, srs }: any) => ({
  x: numberToString(x),
  y: numberToString(y),
  srs,
});

type LocationUiValue = {
  x: string;
  y: string;
  srs: string;
  accuracy?: string;
};

const locationToUiValue = ({
  location,
  nodeDef,
  srsTo,
  srsIndex,
}: {
  location: LocationPoint;
  nodeDef: any;
  srsTo: string;
  srsIndex?: SRSIndex;
}): LocationUiValue | null => {
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

  const result: LocationUiValue = pointToUiValue({
    x: Numbers.roundToPrecision(x, 6),
    y: Numbers.roundToPrecision(y, 6),
    srs: srsTo,
  });

  for (const field of includedExtraFields) {
    // @ts-ignore
    result[field] = numberToString(location[field], 2);
  }
  // always include accuracy
  result.accuracy = numberToString(accuracy, 2);
  return result;
};

const nonNumericFields = new Set(["srs"]);

export const useNodeCoordinateComponent = (props: any) => {
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
    [nodeDef]
  );
  const includedFields = useMemo(
    () => new Set(["x", "y", "srs", ...includedExtraFields]),
    [includedExtraFields]
  );

  const [state, setState] = useState({
    compassNavigatorVisible: false,
  });

  const { compassNavigatorVisible } = state;

  const nodeValueToUiValue = useCallback(
    (nodeValue: any) => {
      const { x, y, srs = defaultSrsCode } = nodeValue ?? {};

      const result = pointToUiValue({ x, y, srs });
      for (const fieldKey of includedExtraFields) {
        // @ts-ignore
        result[fieldKey] = numberToString(nodeValue?.[fieldKey]);
      }
      return result;
    },
    [includedExtraFields, defaultSrsCode]
  );

  const uiValueToNodeValue = useCallback(
    (uiValue: any) => {
      const { x, y, srs } = uiValue ?? {};

      if (Objects.isEmpty(x) && Objects.isEmpty(y)) return null;

      const result = {
        x: stringToNumber(x),
        y: stringToNumber(y),
        srs,
      };
      for (const fieldKey of includedExtraFields) {
        // @ts-ignore
        result[fieldKey] = stringToNumber(uiValue?.[fieldKey]);
      }
      return result;
    },
    [includedExtraFields]
  );

  const isNodeValueEqual = useCallback(
    (nodeValueA: any, nodeValueB: any) => {
      const transformCoordinateValue = (coordVal: NodeValueCoordinate) => {
        if (!coordVal) return null;
        const coordValCleaned: NodeValueCoordinate = Object.entries(
          coordVal
        ).reduce((acc, [key, value]) => {
          if (includedFields.has(key)) {
            // @ts-ignore
            acc[key] = nonNumericFields.has(key)
              ? value
              : Numbers.toNumber(value);
          }
          return acc;
        }, {} as NodeValueCoordinate);

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
    [defaultSrsCode, includedFields]
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
      value: any;
      ignoreDelay?: boolean;
    }) => {
      if (!valueNext.srs && singleSrs) {
        // set default SRS
        valueNext.srs = defaultSrsCode;
      }
      updateNodeValue({ value: valueNext, ignoreDelay });
    },
    [defaultSrsCode, singleSrs, updateNodeValue]
  );

  const onChangeValueField = useCallback(
    (fieldKey: any) => (val: any) => {
      const valueNext = { ...uiValue, [fieldKey]: val };
      onValueChange({ value: valueNext });
    },
    [onValueChange, uiValue]
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
      onValueChange({ value: valueNext });
    },
    [nodeDef, onValueChange, srs, srsIndex]
  );

  const {
    locationAccuracyThreshold,
    locationWatchElapsedTime,
    locationWatchProgress,
    locationWatchTimeout,
    startLocationWatch,
    stopLocationWatch,
    watchingLocation,
  } = useLocationWatch({ locationCallback });

  // Get the distance target for the coordinate node
  const [distanceTarget, setDistanceTarget] = useState(null);
  useSelector((state) => {
    const record = DataEntrySelectors.selectRecord(state);
    const node = Records.getNodeByUuid(nodeUuid)(record);
    RecordNodes.getCoordinateDistanceTarget({
      survey,
      nodeDef,
      record,
      node,
    }).then((_distanceTarget) => {
      if (!Objects.isEqual(_distanceTarget, distanceTarget)) {
        setDistanceTarget(_distanceTarget);
      }
    });
  }, Objects.isEqual);

  useEffect(() => {
    return stopLocationWatch;
  }, [stopLocationWatch]);

  const onChangeSrs = useCallback(
    async (srsTo: any) => {
      dispatch(DataEntryActions.updateCoordinateValueSrs({ nodeUuid, srsTo }));
    },
    [dispatch, nodeUuid]
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
        await updateNodeValue({ value: null, ignoreDelay: true });
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

  const setCompassNavigatorVisible = useCallback(
    (visible: any) =>
      setState((statePrev) => ({
        ...statePrev,
        compassNavigatorVisible: visible,
      })),
    []
  );

  const showCompassNavigator = useCallback(
    () => setCompassNavigatorVisible(true),
    [setCompassNavigatorVisible]
  );
  const hideCompassNavigator = useCallback(
    () => setCompassNavigatorVisible(false),
    [setCompassNavigatorVisible]
  );

  const onCompassNavigatorUseCurrentLocation = useCallback(
    (location: any) => {
      const valueNext = locationToUiValue({
        location,
        nodeDef,
        srsTo: srs,
        srsIndex,
      });
      onValueChange({ value: valueNext, ignoreDelay: true });
    },
    [nodeDef, srs, srsIndex, onValueChange]
  );

  const editable = !NodeDefs.isReadOnly(nodeDef);
  const inputFieldsEditable =
    editable && !NodeDefs.isAllowOnlyDeviceCoordinate(nodeDef);

  const deleteButtonVisible =
    editable &&
    !NodeDefs.isRequired(nodeDef) &&
    uiValue &&
    (Objects.isNotEmpty(uiValue.x) || Objects.isNotEmpty(uiValue.y));

  return {
    accuracy,
    applicable,
    compassNavigatorVisible,
    deleteButtonVisible,
    distanceTarget,
    editable,
    hideCompassNavigator,
    includedExtraFields,
    inputFieldsEditable,
    locationAccuracyThreshold,
    locationWatchElapsedTime,
    locationWatchProgress,
    locationWatchTimeout,
    onChangeSrs,
    onChangeValueField,
    onClearPress,
    onCompassNavigatorUseCurrentLocation,
    onStartGpsPress,
    onStopGpsPress,
    showCompassNavigator,
    srs,
    srsIndex,
    uiValue,
    watchingLocation,
  };
};
