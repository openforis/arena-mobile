import { StyleProp, ViewStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";

import { Button } from "components/Button";
import { TextDirection, useTextDirection } from "localization";
import { DataEntryActions } from "state/dataEntry";

const styleByTextDirection: Record<string, StyleProp<ViewStyle>> = {
  [TextDirection.ltr]: { alignSelf: "flex-start" },
  [TextDirection.rtl]: { alignSelf: "flex-end" },
};

export const NavigateToRecordsListButton = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const textDirection = useTextDirection();

  return (
    <Button
      avoidMultiplePress={false}
      icon="format-list-bulleted"
      onPress={() =>
        DataEntryActions.navigateToRecordsList({ navigation })(dispatch)
      }
      style={styleByTextDirection[textDirection]}
      textKey="dataEntry:listOfRecords"
    />
  );
};
