import { MD3DarkTheme } from "react-native-paper";

export const OFDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "rgba(126, 189, 226, 1)", // light blue
    onPrimary: "rgb(0, 0, 0)", // black (the default is a dark purple)
    secondary: "rgba(123, 185, 42, 0.8)", // light green
    onSecondary: "rgb(51, 51, 51)", // dark grey
    secondaryContainer: "rgba(223, 255, 132, 0.2)", // very light green
  },
};
