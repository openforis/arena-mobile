import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  NodeDefs,
  Numbers,
  Objects,
  PointFactory,
  Points,
  Records,
  Surveys,
} from "@openforis/arena-core";

import { useLocationWatch } from "hooks";
import { RecordNodes } from "model/utils/RecordNodes";
import {
  DataEntryActions,
  DataEntrySelectors,
  SurveySelectors,
  useConfirm,
} from "state";
import { useNodeComponentLocalState } from "../../../useNodeComponentLocalState";

const stringToNumber = (str: any) => Numbers.toNumber(str);
const numberToString = (num: any, roundToDecimals = NaN) => {
  if (Objects.isEmpty(num)) return "";
  return String(Numbers.roundToPrecision(num, roundToDecimals));
};
const pointToUiValue = ({
  x,
  y,
  srs
}: any) => ({
  x: numberToString(x),
  y: numberToString(y),
  srs,
});

const locationToUiValue = ({
  location,
  nodeDef,
  srsTo,
  srsIndex
}: any) => {
  const { coords } = location;
  const { latitude, longitude, accuracy } = coords;

  const pointLatLong = PointFactory.createInstance({
    x: longitude,
    y: latitude,
  });
  const point = Points.transform(pointLatLong, srsTo, srsIndex);
  // @ts-expect-error TS(2339): Property 'x' does not exist on type 'Point | null'... Remove this comment to see the full error message
  const { x, y } = point;

  const includedExtraFields = NodeDefs.getCoordinateAdditionalFields(nodeDef);

  const result = pointToUiValue({
    x: Numbers.roundToPrecision(x, 6),
    y: Numbers.roundToPrecision(y, 6),
    srs: srsTo,
  });

  includedExtraFields.forEach((field) => {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    result[field] = numberToString(coords[field], 2);
  });
  // always include accuracy
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  result["accuracy"] = numberToString(accuracy, 2);
  return result;
};

const nonNumericFields = ["srs"];

export const useNodeCoordinateComponent = (props: any) => {
  const { nodeDef, nodeUuid } = props;

  const dispatch = useDispatch();
  const confirm = useConfirm();
  const survey = SurveySelectors.useCurrentSurvey();
  const srsIndex = SurveySelectors.useCurrentSurveySrsIndex();
  const srss = useMemo(() => Surveys.getSRSs(survey), [survey]);
  const singleSrs = srss.length === 1;
  // @ts-expect-error TS(2532): Object is possibly 'undefined'.
  const defaultSrsCode = srss[0].code;
  const includedExtraFields = useMemo(
    () => NodeDefs.getCoordinateAdditionalFields(nodeDef),
    [nodeDef]
  );
  const includedFields = useMemo(
    () => ["x", "y", "srs", ...includedExtraFields],
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
      includedExtraFields.forEach((fieldKey) => {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        result[fieldKey] = numberToString(nodeValue?.[fieldKey]);
      });
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
      includedExtraFields.forEach((fieldKey) => {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        result[fieldKey] = stringToNumber(uiValue?.[fieldKey]);
      });
      return result;
    },
    [includedExtraFields]
  );

  const isNodeValueEqual = useCallback(
    (nodeValueA: any, nodeValueB: any) => {
      const transformCoordinateValue = (coordVal: any) => {
        if (!coordVal) return null;
        const coordValCleaned = Object.entries(coordVal).reduce(
          (acc, [key, value]) => {
            if (includedFields.includes(key)) {
              // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
              acc[key] = nonNumericFields.includes(key)
                ? value
                : Numbers.toNumber(value);
            }
            return acc;
          },
          {}
        );
        // @ts-expect-error TS(2339): Property 'srs' does not exist on type '{}'.
        if (!coordValCleaned.srs) {
          // @ts-expect-error TS(2339): Property 'srs' does not exist on type '{}'.
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
    // @ts-expect-error TS(7031): Binding element 'valueNext' implicitly has an 'any... Remove this comment to see the full error message
    ({ value: valueNext, ignoreDelay = false }) => {
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
    ({
      location
    }: any) => {
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
    (srsTo: any) => {
      // @ts-expect-error TS(2345): Argument of type '(dispatch: any, getState: any) =... Remove this comment to see the full error message
      dispatch(DataEntryActions.updateCoordinateValueSrs({ nodeUuid, srsTo }));
    },
    [dispatch, nodeUuid]
  );

  const onStartGpsPress = useCallback(async () => {
    if (
      Objects.isEmpty(uiValueX) ||
      Objects.isEmpty(uiValueY) ||
      (await confirm({
        messageKey: "dataEntry:confirmOverwriteValue.message",
      }))
    ) {
      await startLocationWatch();
    }
  }, [confirm, startLocationWatch, uiValueX, uiValueY]);

  const onStopGpsPress = useCallback(() => {
    stopLocationWatch();
  }, [stopLocationWatch]);

  const setCompassNavigatorVisible = useCallback(
    (visible: any) => setState((statePrev) => ({
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
