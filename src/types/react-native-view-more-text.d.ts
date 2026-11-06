import "react-native-view-more-text";

// the library props extend ViewProperties (removed from react-native) and miss children
declare module "react-native-view-more-text" {
  interface ViewMoreTextProps {
    children?: React.ReactNode;
  }
}
