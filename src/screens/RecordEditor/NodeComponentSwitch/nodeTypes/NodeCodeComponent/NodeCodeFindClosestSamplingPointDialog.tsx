import { useCallback, useEffect, useState } from "react";

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

type NodeCodeFindClosestSamplingPointDialogProps = {
  itemLabelFunction: (item: any) => string;
  items: any[];
  onDismiss: () => void;
  onItemSelected: (item: any) => void;
};

export const NodeCodeFindClosestSamplingPointDialog = ({
  itemLabelFunction,
  items,
  onDismiss,
  onItemSelected,
}: NodeCodeFindClosestSamplingPointDialogProps) => {
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
    watchingLocation,
  } = useLocation();

  const [state, setState] = useState({
    findingMinDistanceItems: false,
    minDistance: Number.NaN,
    minDistanceItems: null as any[] | null,
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

    for (const item of items) {
      const itemLocation = item?.props?.extra?.location;
      if (itemLocation) {
        const itemLocationPoint = Points.parse(itemLocation);
        const distance =
          Points.distance(pointLatLong, itemLocationPoint!, srsIndex) ??
          Infinity;
        if (Objects.isEmpty(minDistance) || distance < minDistance) {
          minDistance = distance;
          minDistanceItems = [item];
        } else if (distance === minDistance) {
          minDistanceItems.push(item);
        }
      }
    }
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
        minDistance: Number.NaN,
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
          {watchingLocation && (
            <Text textKey="dataEntry:location.gettingCurrentLocation" />
          )}
          <LocationWatchingMonitor
            locationAccuracy={locationAccuracy}
            locationAccuracyThreshold={locationAccuracyThreshold}
            locationWatchElapsedTime={locationWatchElapsedTime}
            locationWatchTimeout={locationWatchTimeout}
            onStart={startLocationWatch}
            onStop={stopLocationWatch}
            watchingLocation={watchingLocation}
          />
        </>
      )}
      {locationFetched && pointLatLong && (
        <FieldSet headerKey="dataEntry:location.usingCurrentLocation">
          <FormItem labelKey="dataEntry:coordinate.x">
            {pointLatLong.x}
          </FormItem>
          <FormItem labelKey="dataEntry:coordinate.y">
            {pointLatLong.y}
          </FormItem>
          <FormItem labelKey="dataEntry:coordinate.accuracy">
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
      {!watchingLocation && (
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
