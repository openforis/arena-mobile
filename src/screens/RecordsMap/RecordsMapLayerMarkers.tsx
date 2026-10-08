import React, { memo, useCallback } from "react";
import { Text as RNText, View } from "react-native";
import { LatLng, Marker, Region } from "react-native-maps";

import {
  notVisitedSamplingPointColor,
  RecordsMapLayer,
  RecordsMapLayerType,
  RecordsMapPointFeature,
  RecordsMapPointProperties,
  visitedSamplingPointColor,
} from "./recordsMapLayers";
import {
  isClusterFeature,
  RecordsMapClusterFeature,
  useRecordsMapClusters,
} from "./useRecordsMapClusters";

import styles from "./styles";

const clusterMinSize = 28;
const clusterMaxSize = 56;

const partiallyVisitedSamplingPointsColor = "#fb8c00";

const getPointColor = ({
  layer,
  properties,
}: {
  layer: RecordsMapLayer;
  properties: RecordsMapPointProperties;
}) => {
  if (layer.type !== RecordsMapLayerType.samplingPoints) return layer.color;
  return properties.visited
    ? visitedSamplingPointColor
    : notVisitedSamplingPointColor;
};

const getClusterColor = ({
  layer,
  cluster,
}: {
  layer: RecordsMapLayer;
  cluster: RecordsMapClusterFeature;
}) => {
  if (layer.type !== RecordsMapLayerType.samplingPoints) return layer.color;
  const { point_count: count, visitedCount } = cluster.properties;
  if (visitedCount === 0) return notVisitedSamplingPointColor;
  return visitedCount === count
    ? visitedSamplingPointColor
    : partiallyVisitedSamplingPointsColor;
};

const getClusterSize = (count: number) =>
  Math.min(clusterMaxSize, clusterMinSize + Math.log10(count) * 10);

type Props = {
  layer: RecordsMapLayer;
  onClusterPress: (params: {
    layer: RecordsMapLayer;
    expansionRegion: Region;
    leaves: RecordsMapPointProperties[];
  }) => void;
  onPointPress: (params: {
    layer: RecordsMapLayer;
    points: RecordsMapPointProperties[];
  }) => void;
  points: RecordsMapPointFeature[];
  region: Region | null;
};

type ClusterMarkerProps = {
  layer: RecordsMapLayer;
  cluster: RecordsMapClusterFeature;
  coordinate: LatLng;
  onPress: (cluster: RecordsMapClusterFeature) => void;
};

const ClusterMarker = memo((props: ClusterMarkerProps) => {
  const { layer, cluster, coordinate, onPress } = props;
  const count = cluster.properties.point_count;
  const size = getClusterSize(count);
  const color = getClusterColor({ layer, cluster });

  return (
    <Marker
      coordinate={coordinate}
      onPress={() => onPress(cluster)}
      tracksViewChanges={false}
    >
      <View
        style={[
          styles.cluster,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      >
        <RNText
          style={[
            styles.clusterText,
            color === notVisitedSamplingPointColor && styles.clusterTextDark,
          ]}
        >
          {count}
        </RNText>
      </View>
    </Marker>
  );
});

ClusterMarker.displayName = "ClusterMarker";

type PointMarkerProps = {
  layer: RecordsMapLayer;
  properties: RecordsMapPointProperties;
  coordinate: LatLng;
  onPress: Props["onPointPress"];
};

const PointMarker = memo((props: PointMarkerProps) => {
  const { layer, properties, coordinate, onPress } = props;

  return (
    <Marker
      coordinate={coordinate}
      onPress={() => onPress({ layer, points: [properties] })}
      tracksViewChanges={false}
    >
      <View
        style={[
          styles.point,
          { backgroundColor: getPointColor({ layer, properties }) },
        ]}
      />
    </Marker>
  );
});

PointMarker.displayName = "PointMarker";

export const RecordsMapLayerMarkers = memo((props: Props) => {
  const { layer, onClusterPress, onPointPress, points, region } = props;

  const { clusters, getClusterExpansionRegion, getClusterLeaves } =
    useRecordsMapClusters({ points, region });

  const handleClusterPress = useCallback(
    (cluster: RecordsMapClusterFeature) => {
      onClusterPress({
        layer,
        expansionRegion: getClusterExpansionRegion(cluster),
        leaves: getClusterLeaves(cluster).map(
          (leaf) => leaf.properties as RecordsMapPointProperties,
        ),
      });
    },
    [getClusterExpansionRegion, getClusterLeaves, layer, onClusterPress],
  );

  return (
    <>
      {clusters.map((feature) => {
        const [longitude, latitude] = feature.geometry.coordinates as [
          number,
          number,
        ];
        const coordinate = { latitude, longitude };
        if (isClusterFeature(feature)) {
          return (
            <ClusterMarker
              key={`${layer.key}_cluster_${feature.properties.cluster_id}`}
              layer={layer}
              cluster={feature}
              coordinate={coordinate}
              onPress={handleClusterPress}
            />
          );
        }
        return (
          <PointMarker
            key={`${layer.key}_${feature.properties.key}`}
            layer={layer}
            properties={feature.properties}
            coordinate={coordinate}
            onPress={onPointPress}
          />
        );
      })}
    </>
  );
});

RecordsMapLayerMarkers.displayName = "RecordsMapLayerMarkers";
