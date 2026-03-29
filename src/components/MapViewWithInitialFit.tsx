import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { LayoutChangeEvent } from "react-native";
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
  onInitialFitApplied?: () => void;
};

const defaultEdgePadding: EdgePadding = {
  top: 24,
  right: 24,
  bottom: 24,
  left: 24,
};

export const MapViewWithInitialFit = forwardRef<MapView, Props>(
  (
    {
      fitOnlyOnce = true,
      fitToCoordinatesOnReady,
      fitToCoordinatesOptions,
      onInitialFitApplied,
      onMapReady,
      ...mapViewProps
    },
    ref,
  ) => {
    const internalRef = useRef<MapView>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [hasLayout, setHasLayout] = useState(false);
    const hasAppliedFitRef = useRef(false);

    useImperativeHandle(ref, () => internalRef.current as MapView);

    useEffect(() => {
      if (
        !isMapReady ||
        !hasLayout ||
        (fitOnlyOnce && hasAppliedFitRef.current) ||
        !fitToCoordinatesOnReady ||
        fitToCoordinatesOnReady.length === 0
      )
        return;

      const frameId = requestAnimationFrame(() => {
        internalRef.current?.fitToCoordinates(fitToCoordinatesOnReady, {
          edgePadding:
            fitToCoordinatesOptions?.edgePadding ?? defaultEdgePadding,
          animated: fitToCoordinatesOptions?.animated ?? false,
        });

        onInitialFitApplied?.();

        if (fitOnlyOnce) {
          hasAppliedFitRef.current = true;
        }
      });

      return () => {
        cancelAnimationFrame(frameId);
      };
    }, [
      fitOnlyOnce,
      fitToCoordinatesOnReady,
      fitToCoordinatesOptions?.animated,
      fitToCoordinatesOptions?.edgePadding,
      hasLayout,
      isMapReady,
      onInitialFitApplied,
    ]);

    const onMapReadyCallback = useCallback(() => {
      setIsMapReady(true);
      onMapReady?.();
    }, [onMapReady]);

    const onLayoutCallback = useCallback(
      (event: LayoutChangeEvent) => {
        setHasLayout(true);
        mapViewProps.onLayout?.(event);
      },
      [mapViewProps],
    );

    return (
      <MapView
        ref={internalRef}
        onLayout={onLayoutCallback}
        onMapReady={onMapReadyCallback}
        {...mapViewProps}
      />
    );
  },
);

MapViewWithInitialFit.displayName = "MapViewWithInitialFit";
