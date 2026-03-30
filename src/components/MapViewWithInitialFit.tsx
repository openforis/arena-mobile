import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import MapView, { LatLng, MapType, MapViewProps } from "react-native-maps";

import { IconButton } from "./IconButton";
import { log } from "utils";

type EdgePadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type FitToCoordinatesOptions = {
  edgePadding?: EdgePadding;
  animated?: boolean;
};

type Props = MapViewProps & {
  fitToCoordinatesOnReady?: LatLng[];
  fitToCoordinatesOptions?: FitToCoordinatesOptions;
  fitOnlyOnce?: boolean;
  mapTypeSwitcherEnabled?: boolean;
};

const defaultEdgePadding: EdgePadding = {
  top: 24,
  right: 24,
  bottom: 24,
  left: 24,
};

const mapTypes: MapType[] = ["standard", "satellite", "hybrid"];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  mapTypeSwitcher: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
});

export const MapViewWithInitialFit = forwardRef<MapView, Props>(
  (
    {
      children,
      fitOnlyOnce = true,
      fitToCoordinatesOnReady,
      fitToCoordinatesOptions,
      mapType: initialMapType,
      mapTypeSwitcherEnabled = true,
      onMapReady,
      ...mapViewProps
    },
    ref,
  ) => {
    log.debug("rendering MapViewWithInitialFit");

    const internalRef = useRef<MapView>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const hasAppliedFitRef = useRef(false);
    const [mapType, setMapType] = useState<MapType>(
      initialMapType ?? "standard",
    );

    useImperativeHandle(ref, () => internalRef.current as MapView);

    useEffect(() => {
      if (
        !isMapReady ||
        (fitOnlyOnce && hasAppliedFitRef.current) ||
        !fitToCoordinatesOnReady ||
        fitToCoordinatesOnReady.length === 0
      ) {
        return;
      }

      internalRef.current?.fitToCoordinates(fitToCoordinatesOnReady, {
        edgePadding: fitToCoordinatesOptions?.edgePadding ?? defaultEdgePadding,
        animated: fitToCoordinatesOptions?.animated ?? false,
      });

      if (fitOnlyOnce) {
        hasAppliedFitRef.current = true;
      }
    }, [
      fitOnlyOnce,
      fitToCoordinatesOnReady,
      fitToCoordinatesOptions?.animated,
      fitToCoordinatesOptions?.edgePadding,
      isMapReady,
    ]);

    const onMapReadyCallback = useCallback(() => {
      setIsMapReady(true);
      onMapReady?.();
    }, [onMapReady]);

    const onMapTypeSwitchPress = useCallback(() => {
      const currentIndex = mapTypes.indexOf(mapType);
      const nextIndex =
        currentIndex >= 0 ? (currentIndex + 1) % mapTypes.length : 0;
      const nextMapType = mapTypes[nextIndex] ?? "standard";
      setMapType(nextMapType);
    }, [mapType]);

    return (
      <View style={styles.container}>
        <MapView
          ref={internalRef}
          mapType={mapType}
          onMapReady={onMapReadyCallback}
          {...mapViewProps}
        >
          {children}
        </MapView>
        {mapTypeSwitcherEnabled && (
          <IconButton
            icon="layers-outline"
            size={20}
            style={styles.mapTypeSwitcher}
            onPress={onMapTypeSwitchPress}
            mode="contained"
          />
        )}
      </View>
    );
  },
);

MapViewWithInitialFit.displayName = "MapViewWithInitialFit";
