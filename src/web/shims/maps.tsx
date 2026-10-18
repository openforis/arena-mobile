import { forwardRef, ReactNode, useImperativeHandle } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";

type MapViewProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  [key: string]: any;
};

const placeholderStyle: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  minHeight: 100,
  opacity: 0.6,
};

// Web replacement of react-native-maps: maps are not available in the browser preview
const MapView = forwardRef<any, MapViewProps>(({ style }, ref) => {
  useImperativeHandle(ref, () => ({
    animateToRegion: () => {},
    fitToCoordinates: () => {},
    getCamera: async () => ({
      center: { latitude: 0, longitude: 0 },
      heading: 0,
      pitch: 0,
      zoom: 0,
    }),
  }));
  return (
    <View style={[placeholderStyle, style]}>
      <Text>Map not available in the web preview</Text>
    </View>
  );
});
MapView.displayName = "MapView";

const NullComponent = (_props: any) => null;

export const Callout = NullComponent;
export const Circle = NullComponent;
export const Geojson = NullComponent;
export const Marker = NullComponent;
export const Overlay = NullComponent;
export const Polygon = NullComponent;
export const Polyline = NullComponent;
export const UrlTile = NullComponent;
export const WMSTile = NullComponent;
export const PROVIDER_DEFAULT = undefined;
export const PROVIDER_GOOGLE = "google";

export default MapView;
