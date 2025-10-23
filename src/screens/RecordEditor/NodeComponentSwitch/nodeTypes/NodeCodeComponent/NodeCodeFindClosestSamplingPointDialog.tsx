import { useCallback, useEffect, useState } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { Objects, Points } from "@openforis/arena-core";

import {
  Button,
  FieldSet,
  FormItem,
  HView,
  LoadingIcon,
  LocationWatchingMonitor,
  Modal,
  SelectableList,
  Text,
} from "components";
import { useLocation } from "hooks";
import { SurveySelectors } from "state";

export const NodeCodeFindClosestSamplingPointDialog = ({
  itemLabelFunction,
  items,
  onDismiss,
  onItemSelected
}: any) => {
  const srsIndex = SurveySelectors.useCurrentSurveySrsIndex();

  const {
    locationAccuracy,
    locationAccuracyThreshold,
    locationFetched,
    locationWatchElapsedTime,
    locationWatchTimeout,
    pointLatLong,
    startLocationWatch,
    stopLocationWatch,
    wathingLocation,
  } = useLocation();

  const [state, setState] = useState({
    findingMinDistanceItems: false,
    minDistance: NaN,
    minDistanceItems: null,
    selectedMinDistanceItem: null,
  });

  const {
    findingMinDistanceItems,
    minDistance,
    minDistanceItems,
    selectedMinDistanceItem,
  } = state;

  const findItemsWithMinDistance = useCallback(() => {
    let minDistanceItems: any = [];
    let minDistance: any = null;

    items.forEach((item: any) => {
      const itemLocation = item?.props?.extra?.location;
      if (itemLocation) {
        const itemLocationPoint = Points.parse(itemLocation);
        const distance = Points.distance(
          // @ts-expect-error TS(2345): Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
          pointLatLong,
          itemLocationPoint,
          srsIndex
        );
        // @ts-expect-error TS(2531): Object is possibly 'null'.
        if (Objects.isEmpty(minDistance) || distance < minDistance) {
          minDistance = distance;
          minDistanceItems = [item];
        } else if (distance === minDistance) {
          minDistanceItems.push(item);
        }
      }
    });
    return {
      minDistance,
      minDistanceItems,
    };
  }, [items, pointLatLong, srsIndex]);

  useEffect(() => {
    if (items && locationFetched && pointLatLong) {
      setState((statePrev) => ({
        ...statePrev,
        findingMinDistanceItems: true,
        minDistance: NaN,
        minDistanceItems: null,
      }));
      const { minDistance, minDistanceItems } = findItemsWithMinDistance();
      setState((statePrev) => ({
        ...statePrev,
        findingMinDistanceItems: false,
        minDistance,
        minDistanceItems,
      }));
    }
  }, [findItemsWithMinDistance, items, locationFetched, pointLatLong]);

  const onUseSelectedItemPress = useCallback(() => {
    onItemSelected(selectedMinDistanceItem);
  }, [onItemSelected, selectedMinDistanceItem]);

  return (
    <Modal
      titleKey="dataEntry:closestSamplingPoint.findingClosestSamplingPoint"
      onDismiss={onDismiss}
    >
      {!locationFetched && (
        <>
          {wathingLocation && (
            <Text textKey="dataEntry:location.gettingCurrentLocation" />
          )}
          <LocationWatchingMonitor
            locationAccuracy={locationAccuracy}
            locationAccuracyThreshold={locationAccuracyThreshold}
            locationWatchElapsedTime={locationWatchElapsedTime}
            locationWatchTimeout={locationWatchTimeout}
            onStart={startLocationWatch}
            onStop={stopLocationWatch}
            watchingLocation={wathingLocation}
          />
        </>
      )}
      {locationFetched && pointLatLong && (
        // @ts-expect-error TS(2786): 'FieldSet' cannot be used as a JSX component.
        <FieldSet headerKey="dataEntry:location.usingCurrentLocation">
          // @ts-expect-error TS(2786): 'FormItem' cannot be used as a JSX component.
          <FormItem labelKey="dataEntry:coordinate.x">
            // @ts-expect-error TS(2339): Property 'x' does not exist on type 'never'.
            {pointLatLong.x}
          </FormItem>
          // @ts-expect-error TS(2786): 'FormItem' cannot be used as a JSX component.
          <FormItem labelKey="dataEntry:coordinate.y">
            // @ts-expect-error TS(2339): Property 'y' does not exist on type 'never'.
            {pointLatLong.y}
          </FormItem>
          // @ts-expect-error TS(2786): 'FormItem' cannot be used as a JSX component.
          <FormItem labelKey="dataEntry:coordinate.accuracy">
            // @ts-expect-error TS(2339): Property 'toFixed' does not exist on type 'never'.
            {locationAccuracy?.toFixed(2)}
          </FormItem>
        </FieldSet>
      )}

      {findingMinDistanceItems && <LoadingIcon />}

      {minDistanceItems && (
        <>
          <Text
            textKey="dataEntry:closestSamplingPoint.minDistanceItemFound"
            textParams={{
              // @ts-expect-error TS(2339): Property 'length' does not exist on type 'never'.
              count: minDistanceItems.length,
              minDistance: minDistance?.toFixed?.(2),
            }}
          />
          <SelectableList
            itemKeyExtractor={(item: any) => item.uuid}
            itemLabelExtractor={itemLabelFunction}
            items={minDistanceItems}
            onChange={(selectedItems: any) => {
              setState((statePrev) => ({
                ...statePrev,
                selectedMinDistanceItem: selectedItems[0],
              }));
            }}
            selectedItems={
              selectedMinDistanceItem ? [selectedMinDistanceItem] : []
            }
          />
        </>
      )}
      {!wathingLocation && (
        <HView style={{ justifyContent: "center" }}>
          <Button
            disabled={!selectedMinDistanceItem}
            onPress={onUseSelectedItemPress}
            textKey="dataEntry:closestSamplingPoint.useSelectedItem"
          />
        </HView>
      )}
    </Modal>
  );
};

NodeCodeFindClosestSamplingPointDialog.propTypes = {
  itemLabelFunction: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onItemSelected: PropTypes.func.isRequired,
};
