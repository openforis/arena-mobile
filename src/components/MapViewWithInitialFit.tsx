import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import MapView, { LatLng, MapViewProps } from "react-native-maps";

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
};

const defaultEdgePadding: EdgePadding = {
  top: 24,
  right: 24,
  bottom: 24,
  left: 24,
};

export const MapViewWithInitialFit = forwardRef<MapView | null, Props>(
  (
    {
      fitOnlyOnce = true,
      fitToCoordinatesOnReady,
      fitToCoordinatesOptions,
      onMapReady,
      ...mapViewProps
    },
    ref,
  ) => {
    const internalRef = useRef<MapView | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const hasAppliedFitRef = useRef(false);

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

    return (
      <MapView
        ref={internalRef}
        onMapReady={onMapReadyCallback}
        {...mapViewProps}
      />
    );
  },
);

MapViewWithInitialFit.displayName = "MapViewWithInitialFit";
