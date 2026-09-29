import React, { useCallback, useMemo } from "react";
import { Linking } from "react-native";

import { Points } from "@openforis/arena-core";

import { IconButton } from "components/IconButton";
import { Environment } from "utils";

type Props = {
  point?: any;
  size?: number;
  srsIndex?: any;
};

export const OpenMapButton = (props: Props) => {
  const { point, size = 30, srsIndex = undefined } = props;

  const pointLatLng = useMemo(
    () => Points.toLatLong(point, srsIndex),
    [point, srsIndex]
  );

  const { y: latitude, x: longitude } = pointLatLng ?? {};

  const onPress = useCallback(() => {
    // using a query generates an unnamed marker on the map
    const query = `${latitude},${longitude}`;
    const url = Environment.isIOS
      ? `maps://?q=${query}`
      : `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch((error) =>
      console.error("Error opening map", error)
    );
  }, [latitude, longitude]);

  if (!pointLatLng) return null;

  return <IconButton icon="map" onPress={onPress} size={size} />;
};
