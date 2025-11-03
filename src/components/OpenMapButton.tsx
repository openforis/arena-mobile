import React, { useCallback, useMemo } from "react";
import openMap from "react-native-open-maps";

import { Points } from "@openforis/arena-core";

import { IconButton } from "components/IconButton";

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

  const onPress = useCallback(
    () =>
      openMap({
        // latitude: Number(latitude),
        // longitude: Number(longitude),
        query: `${latitude},${longitude}`, // this way generates an unnamed marker on the map,
      }),
    [latitude, longitude]
  );

  if (!pointLatLng) return null;

  return <IconButton icon="map" onPress={onPress} size={size} />;
};
