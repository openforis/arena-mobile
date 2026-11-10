import { useCallback, useMemo, useState } from "react";

import { Objects, Points } from "@openforis/arena-core";

import {
  Button,
  FieldSet,
  FormItem,
  HView,
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
    locationWatchStatus,
    locationWatchElapsedTime,
    locationWatchTimeout,
    pointLatLong,
    startLocationWatch,
    stopLocationWatch,
    watchingLocation,
  } = useLocation();

  const [selectedMinDistanceItem, setSelectedMinDistanceItem] =
    useState<any>(null);

  const findItemsWithMinDistance = useCallback(() => {
    let minDistanceItems: any = [];
    let minDistance: any = null;

    for (const item of items) {
      const itemLocation = item?.props?.extra?.location;
      if (!itemLocation) {
        continue;
      }
      const itemLocationPoint = Points.parse(itemLocation);
      let distance: number;
      if (pointLatLong) {
        distance =
          Points.distance(pointLatLong, itemLocationPoint!, srsIndex) ??
          Infinity;
      } else {
        distance = Infinity;
      }
      const isFirstItem = Objects.isEmpty(minDistance);
      if (isFirstItem || distance < minDistance) {
        minDistance = distance;
        minDistanceItems = [item];
      } else if (distance === minDistance) {
        minDistanceItems.push(item);
      }
    }
    return {
      minDistance,
      minDistanceItems,
    };
  }, [items, pointLatLong, srsIndex]);

  const { minDistance, minDistanceItems } = useMemo(
    (): { minDistance: number; minDistanceItems: any[] | null } =>
      items && locationFetched && pointLatLong
        ? findItemsWithMinDistance()
        : { minDistance: Number.NaN, minDistanceItems: null },
    [findItemsWithMinDistance, items, locationFetched, pointLatLong],
  );

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
            locationWatchStatus={locationWatchStatus}
            locationWatchTimeout={locationWatchTimeout}
            onStart={startLocationWatch}
            onStop={stopLocationWatch}
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
              setSelectedMinDistanceItem(selectedItems[0]);
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
