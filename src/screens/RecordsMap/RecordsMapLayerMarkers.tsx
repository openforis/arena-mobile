import React, { memo, useCallback } from "react";
import { Text as RNText, View } from "react-native";
import { Marker, Region } from "react-native-maps";

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
          const count = feature.properties.point_count;
          const size = getClusterSize(count);
          const color = getClusterColor({ layer, cluster: feature });
          return (
            <Marker
              key={`${layer.key}_cluster_${feature.properties.cluster_id}`}
              coordinate={coordinate}
              onPress={() => handleClusterPress(feature)}
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
                    color === notVisitedSamplingPointColor &&
                      styles.clusterTextDark,
                  ]}
                >
                  {count}
                </RNText>
              </View>
            </Marker>
          );
        }
        const { properties } = feature;
        return (
          <Marker
            key={`${layer.key}_${properties.key}`}
            coordinate={coordinate}
            onPress={() => onPointPress({ layer, points: [properties] })}
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
      })}
    </>
  );
});

RecordsMapLayerMarkers.displayName = "RecordsMapLayerMarkers";
