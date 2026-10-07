import { useCallback, useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { Region } from "react-native-maps";
import Supercluster from "supercluster";

import {
  RecordsMapPointFeature,
  RecordsMapPointProperties,
} from "./recordsMapLayers";

const clusterRadius = 60;
const clusterMaxZoom = 17;
const tileSize = 256;

export type RecordsMapClusterProperties = { visitedCount: number };

export type RecordsMapClusterFeature =
  Supercluster.ClusterFeature<RecordsMapClusterProperties>;

export type RecordsMapCluster =
  | RecordsMapClusterFeature
  | Supercluster.PointFeature<RecordsMapPointProperties>;

export const isClusterFeature = (
  feature: RecordsMapCluster,
): feature is RecordsMapClusterFeature =>
  !!(feature.properties as Supercluster.ClusterProperties).cluster;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const regionToBBox = (region: Region): GeoJSON.BBox => [
  clamp(region.longitude - region.longitudeDelta / 2, -180, 180),
  clamp(region.latitude - region.latitudeDelta / 2, -90, 90),
  clamp(region.longitude + region.longitudeDelta / 2, -180, 180),
  clamp(region.latitude + region.latitudeDelta / 2, -90, 90),
];

// clusters of the points of a single layer in the visible region (one supercluster index per layer)
export const useRecordsMapClusters = ({
  points,
  region,
}: {
  points: RecordsMapPointFeature[];
  region: Region | null;
}) => {
  const { width } = useWindowDimensions();

  const index = useMemo(() => {
    const supercluster = new Supercluster<
      RecordsMapPointProperties,
      RecordsMapClusterProperties
    >({
      radius: clusterRadius,
      maxZoom: clusterMaxZoom,
      map: (props) => ({ visitedCount: props.visited ? 1 : 0 }),
      reduce: (accumulated, props) => {
        accumulated.visitedCount += props.visitedCount;
      },
    });
    supercluster.load(points);
    return supercluster;
  }, [points]);

  const regionToZoom = useCallback(
    (r: Region) =>
      Math.round(
        Math.log2(
          (360 * (width / tileSize)) / Math.max(r.longitudeDelta, 1e-9),
        ),
      ),
    [width],
  );

  const clusters = useMemo((): RecordsMapCluster[] => {
    if (!region || points.length === 0) return [];
    const zoom = clamp(regionToZoom(region), 0, clusterMaxZoom + 1);
    return index.getClusters(regionToBBox(region), zoom);
  }, [index, points.length, region, regionToZoom]);

  // region to animate to in order to split the given cluster
  const getClusterExpansionRegion = useCallback(
    (cluster: RecordsMapClusterFeature): Region => {
      const zoom = Math.min(
        index.getClusterExpansionZoom(cluster.properties.cluster_id),
        clusterMaxZoom + 1,
      );
      const longitudeDelta = (360 * (width / tileSize)) / 2 ** zoom;
      const [longitude, latitude] = cluster.geometry.coordinates as [
        number,
        number,
      ];
      return {
        latitude,
        longitude,
        latitudeDelta: longitudeDelta,
        longitudeDelta,
      };
    },
    [index, width],
  );

  const getClusterLeaves = useCallback(
    (cluster: RecordsMapClusterFeature, limit = 100) =>
      index.getLeaves(cluster.properties.cluster_id, limit),
    [index],
  );

  return { clusters, getClusterExpansionRegion, getClusterLeaves };
};
