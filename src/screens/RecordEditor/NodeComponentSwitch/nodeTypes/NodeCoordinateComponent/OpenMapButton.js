import React, { useCallback, useMemo } from "react";
import openMap from "react-native-open-maps";
import PropTypes from "prop-types";

import { IconButton } from "components/IconButton";
import { Points } from "@openforis/arena-core";

export const OpenMapButton = (props) => {
  const { point, srsIndex } = props;

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

  return <IconButton icon="map" onPress={onPress} size={30} />;
};

OpenMapButton.propTypes = {
  point: PropTypes.object,
  srsIndex: PropTypes.object.isRequired,
};
