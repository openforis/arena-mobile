import { StyleProp, ViewStyle } from "react-native";

import { ScrollView } from "../ScrollView";

import appStyles from "appStyles";

type Props = {
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export const ScreenView = ({ children, contentContainerStyle }: Props) => (
  <ScrollView
    style={appStyles.screenContainer}
    contentContainerStyle={contentContainerStyle}
  >
    {children}
  </ScrollView>
);
