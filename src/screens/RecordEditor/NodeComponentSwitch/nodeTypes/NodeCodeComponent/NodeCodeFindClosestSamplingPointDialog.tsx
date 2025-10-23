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
// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
} from "components";
// @ts-expect-error TS(2307): Cannot find module 'hooks' or its corresponding ty... Remove this comment to see the full error message
import { useLocation } from "hooks";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
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
          pointLatLong,
          // @ts-expect-error TS(2345): Argument of type 'Point | null' is not assignable ... Remove this comment to see the full error message
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
