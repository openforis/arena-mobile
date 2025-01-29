import React, { useCallback } from "react";

import { Objects } from "@openforis/arena-core";

import { HView, IconButton, Text, TextInput, VView } from "components";
import { LocationWatchingMonitor } from "components/LocationWatchingMonitor";
import { SrsDropdown } from "../../../SrsDropdown";
import { useNodeCoordinateComponent } from "./useNodeCoordinateComponent";
import { LocationNavigator } from "./LocationNavigator";
import { OpenMapButton } from "./OpenMapButton";
import { NodeComponentPropTypes } from "../nodeComponentPropTypes";

import styles from "./styles";

export const NodeCoordinateComponent = (props) => {
  const { nodeDef } = props;

  if (__DEV__) {
    console.log(`rendering NodeCoordinateComponent for ${nodeDef.props.name}`);
  }

  const {
    accuracy,
    applicable,
    compassNavigatorVisible,
    deleteButtonVisible,
    distanceTarget,
    editable,
    hideCompassNavigator,
    includedExtraFields,
    locationAccuracyThreshold,
    locationWatchElapsedTime,
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
  } = useNodeCoordinateComponent(props);

  const createNumericFieldFormItem = useCallback(
    ({ fieldKey, labelStyle = styles.formItemLabel }) => (
      <HView key={fieldKey} style={styles.formItem}>
        <Text style={labelStyle} textKey={`dataEntry:coordinate.${fieldKey}`} />
        <TextInput
          editable={editable && !watchingLocation}
          keyboardType="numeric"
          style={[
            styles.numericTextInput,
            ...(applicable ? [] : [styles.textInputNotApplicable]),
          ]}
          onChange={onChangeValueField(fieldKey)}
          value={uiValue?.[fieldKey] ?? ""}
        />
      </HView>
    ),
    [applicable, editable, onChangeValueField, uiValue, watchingLocation]
  );

  return (
    <VView style={styles.mainContainer}>
      <HView style={styles.internalContainer}>
        <VView style={styles.fieldsWrapper}>
          {createNumericFieldFormItem({ fieldKey: "x" })}
          {createNumericFieldFormItem({ fieldKey: "y" })}
        </VView>
        {!watchingLocation && (
          <VView style={styles.internalContainer}>
            <HView style={styles.internalContainer}>
              {uiValue && <OpenMapButton point={uiValue} srsIndex={srsIndex} />}
              {distanceTarget && (
                <IconButton
                  icon="compass-outline"
                  onPress={showCompassNavigator}
                  size={30}
                  style={styles.showCompassButton}
                />
              )}
            </HView>
            {deleteButtonVisible && (
              <IconButton icon="trash-can-outline" onPress={onClearPress} />
            )}
          </VView>
        )}
      </HView>
      <HView style={styles.formItem}>
        <Text style={styles.formItemLabel} textKey="common:srs" />
        <SrsDropdown
          editable={editable && !watchingLocation}
          onChange={onChangeSrs}
          value={srs}
        />
      </HView>
      {includedExtraFields.map((fieldKey) =>
        createNumericFieldFormItem({
          fieldKey,
          labelStyle: styles.extraFieldFormItemLabel,
        })
      )}
      {
        // always show accuracy (as read-only if not included in extra fields)
        !Objects.isEmpty(accuracy) &&
          !includedExtraFields.includes("accuracy") &&
          createNumericFieldFormItem({
            fieldKey: "accuracy",
            labelStyle: styles.extraFieldFormItemLabel,
          })
      }
      {editable && (
        <LocationWatchingMonitor
          locationAccuracy={accuracy}
          locationAccuracyThreshold={locationAccuracyThreshold}
          locationWatchElapsedTime={locationWatchElapsedTime}
          locationWatchTimeout={locationWatchTimeout}
          onStart={onStartGpsPress}
          onStop={onStopGpsPress}
          watchingLocation={watchingLocation}
        />
      )}
      {compassNavigatorVisible && (
        <LocationNavigator
          onDismiss={hideCompassNavigator}
          onUseCurrentLocation={onCompassNavigatorUseCurrentLocation}
          targetPoint={distanceTarget}
        />
      )}
    </VView>
  );
};

NodeCoordinateComponent.propTypes = NodeComponentPropTypes;
