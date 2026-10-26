import { useTheme } from "react-native-paper";

import { AppTheme } from "./types";

export const useAppTheme = (): AppTheme => useTheme<AppTheme>();
