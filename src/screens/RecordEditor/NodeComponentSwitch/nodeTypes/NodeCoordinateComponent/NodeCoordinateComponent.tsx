import React, { useCallback } from "react";

import { Objects } from "@openforis/arena-core";

import {
  HView,
  IconButton,
  OpenMapButton,
  Text,
  TextInput,
  VView,
} from "components";
import { LocationWatchingMonitor } from "components/LocationWatchingMonitor";
import { log } from "utils";
import { SrsDropdown } from "../../../SrsDropdown";
import { useNodeCoordinateComponent } from "./useNodeCoordinateComponent";
import { LocationNavigator } from "./LocationNavigator";
import { NodeComponentProps } from "../nodeComponentPropTypes";

import styles from "./styles";

export const NodeCoordinateComponent = (props: NodeComponentProps) => {
  const { nodeDef } = props;

  log.debug(`rendering NodeCoordinateComponent for ${nodeDef.props.name}`);

  const {
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
  } = useNodeCoordinateComponent(props);

  const createNumericFieldFormItem = useCallback(
    ({ fieldKey, labelStyle = styles.formItemLabel }: any) => (
      <HView key={fieldKey} style={styles.formItem}>
        <Text style={labelStyle} textKey={`dataEntry:coordinate.${fieldKey}`} />
        <TextInput
          editable={inputFieldsEditable && !watchingLocation}
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
    [
      applicable,
      inputFieldsEditable,
      onChangeValueField,
      uiValue,
      watchingLocation,
    ]
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
          activeLocationSourceId={activeLocationSourceId}
          availableGpsSources={availableGpsSources}
          connectingSourceId={connectingSourceId}
          gpsSourcesLoading={gpsSourcesLoading}
          locationAccuracy={accuracy}
          locationAccuracyThreshold={locationAccuracyThreshold}
          locationSourceUnavailable={locationSourceUnavailable}
          locationWatchElapsedTime={locationWatchElapsedTime}
          locationWatchStatus={locationWatchStatus}
          locationWatchTimeout={locationWatchTimeout}
          onCancelConnecting={onCancelGpsConnectPress}
          onGpsDevicePaired={onGpsDevicePaired}
          onSelectGpsSource={onSelectGpsSource}
          onStart={onStartGpsPress}
          onStop={onStopGpsPress}
          preferredGpsSourceId={preferredGpsSourceId}
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
