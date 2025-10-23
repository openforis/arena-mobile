import { DefaultTheme } from "react-native-paper";

export const OFLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "rgba(96, 159, 196, 1)", // light blue
    secondary: "rgba(123, 185, 42, 0.8)", // light green
    onSecondary: "rgb(51, 51, 51)", // dark grey
    secondaryContainer: "rgba(123, 185, 42, 0.1)", // very light green
  },
};
