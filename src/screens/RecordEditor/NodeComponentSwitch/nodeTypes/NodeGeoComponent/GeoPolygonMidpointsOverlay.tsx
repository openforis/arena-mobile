import React, { useMemo } from "react";

import { LatLng } from "model";

import { GeoVertexMarker } from "./GeoVertexMarker";
import styles, { midpointDefaultBorderColor } from "./styles";

export type GeoPolygonMidpoint = {
  key: string;
  coordinate: LatLng;
  insertAtIndex: number;
};

type GeoPolygonMidpointsOverlayProps = {
  midpoints: GeoPolygonMidpoint[];
  strokeColor: string | undefined;
  draggingMidpointInsertAtIndex: number | null;
  onMidpointDragStart: (insertAtIndex: number) => void;
  onMidpointDrag: (insertAtIndex: number, coordinate: LatLng) => void;
  onMidpointDragEnd: (insertAtIndex: number, coordinate: LatLng) => void;
};

const markerAnchor = { x: 0.13, y: 0.13 };
const draggingMarkerAnchor = { x: 0.35, y: 0.35 };

export const GeoPolygonMidpointsOverlay = ({
  midpoints,
  strokeColor,
  draggingMidpointInsertAtIndex,
  onMidpointDragStart,
  onMidpointDrag,
  onMidpointDragEnd,
}: GeoPolygonMidpointsOverlayProps) => {
  const markerColor = strokeColor ?? midpointDefaultBorderColor;

  const getOuterStyle = useMemo(
    () => (isDragging: boolean) => [
      styles.midpoint,
      isDragging && styles.midpointDragging,
      { borderColor: markerColor },
    ],
    [markerColor],
  );

  const getCoreStyle = useMemo(
    () => (isDragging: boolean) => [
      styles.vertexPointCore,
      isDragging && styles.vertexPointCoreDragging,
      { backgroundColor: markerColor },
    ],
    [markerColor],
  );

  if (midpoints.length === 0) return null;

  return (
    <>
      {midpoints.map(({ key, coordinate, insertAtIndex }) => {
        const isDragging = draggingMidpointInsertAtIndex === insertAtIndex;

        return (
          <GeoVertexMarker
            key={`polygon-midpoint-${key}`}
            coordinate={coordinate}
            anchor={isDragging ? draggingMarkerAnchor : markerAnchor}
            outerStyle={getOuterStyle(isDragging)}
            coreStyle={getCoreStyle(isDragging)}
            onDragStart={() => onMidpointDragStart(insertAtIndex)}
            onDrag={(draggedCoordinate) =>
              onMidpointDrag(insertAtIndex, draggedCoordinate)
            }
            onDragEnd={(draggedCoordinate) =>
              onMidpointDragEnd(insertAtIndex, draggedCoordinate)
            }
          />
        );
      })}
    </>
  );
};
