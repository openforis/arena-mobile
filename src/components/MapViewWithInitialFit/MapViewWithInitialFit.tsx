import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import MapView, {
  MapPressEvent,
  MapType,
  PanDragEvent,
  Region,
} from "react-native-maps";

import { LatLng } from "model";
import { IconButton } from "../IconButton";
import styles from "./styles";

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

type Props = {
  children?: React.ReactNode;
  fitToCoordinatesOnReady?: LatLng[];
  fitToCoordinatesOptions?: FitToCoordinatesOptions;
  fitOnlyOnce?: boolean;
  initialRegion: Region;
  onMapReady?: () => void;
  onPanDrag?: (event: PanDragEvent) => void;
  onPress?: (event: MapPressEvent) => void;
  showMapTypeSelector?: boolean;
  style?: StyleProp<ViewStyle>;
};

const defaultEdgePadding: EdgePadding = {
  top: 24,
  right: 24,
  bottom: 24,
  left: 24,
};

const mapTypes: MapType[] = ["standard", "satellite", "hybrid"];

export const MapViewWithInitialFit = forwardRef<MapView | null, Props>(
  (
    {
      children,
      fitOnlyOnce = true,
      fitToCoordinatesOnReady,
      fitToCoordinatesOptions,
      onMapReady,
      showMapTypeSelector = true,
      style,
      initialRegion,
      onPress,
      onPanDrag,
    },
    ref,
  ) => {
    const internalRef = useRef<MapView | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const hasAppliedFitRef = useRef(false);
    const [mapType, setMapType] = useState<MapType>("standard");

    useImperativeHandle<MapView | null, MapView | null>(
      ref,
      () => internalRef.current,
    );

    useEffect(() => {
      if (!isMapReady || (fitOnlyOnce && hasAppliedFitRef.current)) return;
      if (!fitToCoordinatesOnReady || fitToCoordinatesOnReady.length < 3)
        return;

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

    const handleMapTypeChange = useCallback(() => {
      setMapType((prevMapType) => {
        const currentIndex = mapTypes.indexOf(prevMapType);
        const nextIndex = (currentIndex + 1) % mapTypes.length;
        return mapTypes[nextIndex] ?? "standard";
      });
    }, []);

    return (
      <View style={styles.container}>
        <MapView
          ref={internalRef}
          style={style}
          initialRegion={initialRegion}
          onPress={onPress}
          onPanDrag={onPanDrag}
          onMapReady={onMapReadyCallback}
          mapType={mapType}
        >
          {children}
        </MapView>
        {showMapTypeSelector && (
          <View style={styles.mapTypeSelector}>
            <IconButton
              icon="layers-outline"
              mode="contained"
              onPress={handleMapTypeChange}
              size={18}
            />
          </View>
        )}
      </View>
    );
  },
);

MapViewWithInitialFit.displayName = "MapViewWithInitialFit";
