import type { ReactNode } from "react";

// "children" is missing from the library prop types
declare module "react-native-side-drawer" {
  interface MenuDrawerProps {
    children?: ReactNode;
  }
}
