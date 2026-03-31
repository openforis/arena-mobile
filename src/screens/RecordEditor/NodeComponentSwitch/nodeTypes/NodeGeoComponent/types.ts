import { LatLng } from "react-native-maps";
import type { MapPolygonExtendedProps } from "@siposdani87/expo-maps-polygon-editor";

export interface PolygonMidpoint {
  uuid: string;
  coordinate: LatLng;
  insertAtIndex: number;
}

export interface LocalState {
  editable: boolean;
  draftCoordinates: LatLng[];
  polygons: MapPolygonExtendedProps[];
  isPolygonSelected?: boolean;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  shouldFitInitialPolygon?: boolean;
}
