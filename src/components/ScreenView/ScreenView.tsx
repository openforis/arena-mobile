import { ScrollView } from "../ScrollView";

import appStyles from "appStyles";

type Props = {
  children?: React.ReactNode;
};

export const ScreenView = ({
  children
}: Props) => (
  <ScrollView style={appStyles.screenContainer}>{children}</ScrollView>
);
