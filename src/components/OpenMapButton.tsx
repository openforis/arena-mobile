import React, { useCallback, useMemo } from "react";
import openMap from "react-native-open-maps";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { Points } from "@openforis/arena-core";

import { IconButton } from "components/IconButton";

export const OpenMapButton = (props: any) => {
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

OpenMapButton.propTypes = {
  point: PropTypes.object,
  size: PropTypes.number,
  srsIndex: PropTypes.object,
};
