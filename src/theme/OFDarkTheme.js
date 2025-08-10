import { MD3DarkTheme } from "react-native-paper";

export const OFDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "rgba(126, 189, 226, 1)", // light blue
    secondary: "rgba(123, 185, 42, 0.8)", // light green
    secondaryContainer: "rgba(223, 255, 132, 0.2)", // very light green
  },
};
