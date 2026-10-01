import React, { useCallback } from "react";

import { LatLng } from "model";

import { GeoVertexMarker } from "./GeoVertexMarker";
import styles from "./styles";

type GeoPolygonVerticesOverlayProps = {
  coordinates: LatLng[];
  strokeColor: string | undefined;
  selectedVertexIndex: number | null;
  draggingVertexIndex: number | null;
  onVertexPress: (index: number) => void;
  onVertexDragStart: (index: number) => void;
  onVertexDrag: (index: number, coordinate: LatLng) => void;
  onVertexDragEnd: (index: number, coordinate: LatLng) => void;
};

type StyleGetterProps = {
  isSelected: boolean;
  isDragging: boolean;
};

const markerAnchor = { x: 0.2, y: 0.2 };
const selectedMarkerAnchor = { x: 0.35, y: 0.35 };

export const GeoPolygonVerticesOverlay = ({
  coordinates,
  strokeColor,
  selectedVertexIndex,
  draggingVertexIndex,
  onVertexPress,
  onVertexDragStart,
  onVertexDrag,
  onVertexDragEnd,
}: GeoPolygonVerticesOverlayProps) => {
  const markerColor = strokeColor ?? "#ffffff";

  const getOuterStyle = useCallback(
    ({ isSelected, isDragging }: StyleGetterProps) => [
      styles.vertexPoint,
      isSelected && styles.vertexPointSelected,
      isDragging && styles.vertexPointDragging,
      { borderColor: markerColor },
    ],
    [markerColor],
  );

  const getCoreStyle = useCallback(
    ({ isSelected, isDragging }: StyleGetterProps) => [
      styles.vertexPointCore,
      isSelected && styles.vertexPointCoreSelected,
      isDragging && styles.vertexPointCoreDragging,
      { backgroundColor: markerColor },
    ],
    [markerColor],
  );

  if (coordinates.length === 0) return null;

  return (
    <>
      {coordinates.map((coordinate, index) => {
        const isSelected = selectedVertexIndex === index;
        const isDragging = draggingVertexIndex === index;
        const styleGetterProps: StyleGetterProps = { isSelected, isDragging };

        return (
          <GeoVertexMarker
            key={`polygon-vertex-${index}-${coordinate.latitude}-${coordinate.longitude}`}
            coordinate={coordinate}
            anchor={isSelected ? selectedMarkerAnchor : markerAnchor}
            draggable={isSelected}
            outerStyle={getOuterStyle(styleGetterProps)}
            coreStyle={getCoreStyle(styleGetterProps)}
            onPress={() => onVertexPress(index)}
            onDragStart={() => onVertexDragStart(index)}
            onDrag={(draggedCoordinate) =>
              onVertexDrag(index, draggedCoordinate)
            }
            onDragEnd={(draggedCoordinate) =>
              onVertexDragEnd(index, draggedCoordinate)
            }
          />
        );
      })}
    </>
  );
};
