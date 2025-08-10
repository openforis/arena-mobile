import { DefaultTheme } from "react-native-paper";

export const OFLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "rgba(96, 159, 196, 1)", // light blue
    secondary: "rgba(123, 185, 42, 0.8)", // light green
    secondaryContainer: "rgba(123, 185, 42, 0.1)", // very light green
  },
};
