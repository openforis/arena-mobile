import { StyleProp, TextStyle } from "react-native";
import { List } from "react-native-paper";

import { useTranslation } from "localization";

type Props = {
  style?: StyleProp<TextStyle>;
  textKey: string;
};

export const ListSubheader = (props: Props) => {
  const { style, textKey } = props;
  const { t } = useTranslation();
  return <List.Subheader style={style}>{t(textKey)}</List.Subheader>;
};
