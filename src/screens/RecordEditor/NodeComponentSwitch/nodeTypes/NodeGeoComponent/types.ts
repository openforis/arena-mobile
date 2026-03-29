import { LatLng } from "react-native-maps";

export interface PolygonMidpoint {
  uuid: string;
  coordinate: LatLng;
  insertAtIndex: number;
}
