import React, { useCallback, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { Points } from "@openforis/arena-core";

import { IconButton } from "components/IconButton";
import { MapAppChooserDialog } from "components/MapAppChooserDialog";
import { screenKeys } from "screens/screenKeys";
import { MapApp, MapAppsService } from "service/mapApps";
import { log } from "utils";

type Props = {
  point?: any;
  size?: number;
  srsIndex?: any;
};

type ChooserState = { apps: MapApp[]; selectedId: string };

export const OpenMapButton = (props: Props) => {
  const { point, size = 30, srsIndex = undefined } = props;

  const navigation = useNavigation();
  const [chooser, setChooser] = useState<ChooserState | null>(null);

  const pointLatLng = useMemo(
    () => Points.toLatLong(point, srsIndex),
    [point, srsIndex],
  );

  // coordinates can be strings, but native maps require numbers
  const latitude = pointLatLng ? Number(pointLatLng.y) : undefined;
  const longitude = pointLatLng ? Number(pointLatLng.x) : undefined;

  const onPress = useCallback(async () => {
    if (latitude == null || longitude == null) return;
    try {
      setChooser(await MapAppsService.loadChoices({ latitude, longitude }));
    } catch (error) {
      log.error("error loading map apps", error);
      setChooser({ apps: [], selectedId: MapAppsService.inAppChoiceId });
    }
  }, [latitude, longitude]);

  const onClose = useCallback(() => setChooser(null), []);

  const onSelect = useCallback(
    (selectedId: string) =>
      setChooser((prev) => (prev ? { ...prev, selectedId } : prev)),
    [],
  );

  const onConfirm = useCallback(async () => {
    if (!chooser || latitude == null || longitude == null) return;
    const { selectedId } = chooser;
    setChooser(null);
    try {
      await MapAppsService.rememberChoice(selectedId);
      if (selectedId === MapAppsService.inAppChoiceId) {
        navigation.navigate(
          ...([screenKeys.locationMapViewer, { latitude, longitude }] as never),
        );
      } else {
        await MapAppsService.openApp(selectedId, { latitude, longitude });
      }
    } catch (error) {
      log.error("error opening map", error);
    }
  }, [chooser, latitude, longitude, navigation]);

  if (!pointLatLng) return null;

  return (
    <>
      <IconButton icon="map" onPress={onPress} size={size} />
      {chooser && (
        <MapAppChooserDialog
          apps={chooser.apps}
          onClose={onClose}
          onConfirm={onConfirm}
          onSelect={onSelect}
          selectedId={chooser.selectedId}
        />
      )}
    </>
  );
};
