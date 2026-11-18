import React, { memo } from "react";
import { View } from "react-native";
import { Marker, Polygon, Polyline } from "react-native-maps";

import styles from "./styles";
import type { SurveyMapLayerWithGeometries } from "./useSurveyMapLayers";

const pointAnchor = { x: 0.5, y: 0.5 };

type Props = {
  items: SurveyMapLayerWithGeometries[];
};

// shapes are not tappable: presses must reach the map (e.g. to add the vertices of a polygon)
export const SurveyMapLayersOverlays = memo(({ items }: Props) => (
  <>
    {items.map(({ layer, geometries }) => (
      <React.Fragment key={layer.key}>
        {geometries.polygons.map((polygon, index) => (
          <Polygon
            key={`${layer.key}_polygon_${index}`}
            coordinates={polygon.coordinates}
            fillColor={`${layer.color}33`}
            holes={polygon.holes}
            strokeColor={layer.color}
            strokeWidth={2}
            tappable={false}
          />
        ))}
        {geometries.lines.map((line, index) => (
          <Polyline
            key={`${layer.key}_line_${index}`}
            coordinates={line.coordinates}
            strokeColor={layer.color}
            strokeWidth={2}
            tappable={false}
          />
        ))}
        {/* shortcut: points not clustered (unlike the records map), slow with thousands of points */}
        {geometries.points.map((point, index) => (
          <Marker
            key={`${layer.key}_point_${index}`}
            anchor={pointAnchor}
            coordinate={point.coordinate}
            title={point.name}
            tracksViewChanges={false}
          >
            <View
              style={[
                styles.surveyLayerPoint,
                { backgroundColor: layer.color },
              ]}
            />
          </Marker>
        ))}
      </React.Fragment>
    ))}
  </>
));

SurveyMapLayersOverlays.displayName = "SurveyMapLayersOverlays";
