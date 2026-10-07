import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Points } from "@openforis/arena-core";

import { Button } from "components/Button";
import { Dialog } from "components/Dialog";
import { IconButton } from "components/IconButton";
import { VView } from "components/VView";
import { screenKeys } from "screens/screenKeys";
import { MapApp, MapAppsService } from "service/mapApps";
import { log } from "utils";

type Props = {
  point?: any;
  size?: number;
  srsIndex?: any;
};

const styles = StyleSheet.create({
  options: { gap: 4 },
});

export const OpenMapButton = (props: Props) => {
  const { point, size = 30, srsIndex = undefined } = props;

  const navigation = useNavigation();
  const [apps, setApps] = useState<MapApp[] | null>(null);

  const pointLatLng = useMemo(
    () => Points.toLatLong(point, srsIndex),
    [point, srsIndex],
  );

  const { y: latitude, x: longitude } = pointLatLng ?? {};

  const onPress = useCallback(async () => {
    if (latitude == null || longitude == null) return;
    try {
      setApps(await MapAppsService.getInstalledApps({ latitude, longitude }));
    } catch (error) {
      log.error("error loading map apps", error);
      setApps([]);
    }
  }, [latitude, longitude]);

  const onClose = useCallback(() => setApps(null), []);

  const onInAppPress = useCallback(() => {
    setApps(null);
    navigation.navigate(
      ...([screenKeys.locationMapViewer, { latitude, longitude }] as never),
    );
  }, [latitude, longitude, navigation]);

  const onAppPress = useCallback(
    async (app: MapApp) => {
      if (latitude == null || longitude == null) return;
      setApps(null);
      try {
        await MapAppsService.openApp(app.id, { latitude, longitude });
      } catch (error) {
        log.error("error opening map app", error);
      }
    },
    [latitude, longitude],
  );

  if (!pointLatLng) return null;

  return (
    <>
      <IconButton icon="map" onPress={onPress} size={size} />
      {apps && (
        <Dialog
          onClose={onClose}
          showActions={false}
          title="dataEntry:coordinate.map.chooserTitle"
        >
          <VView style={styles.options}>
            <Button
              icon="cellphone"
              color="secondary"
              onPress={onInAppPress}
              textKey="dataEntry:coordinate.map.inApp"
            />
            {apps.map((app) => (
              <Button
                key={app.id}
                icon="map-marker"
                color="secondary"
                onPress={() => onAppPress(app)}
                textIsI18nKey={false}
                textKey={app.name}
              />
            ))}
          </VView>
        </Dialog>
      )}
    </>
  );
};
