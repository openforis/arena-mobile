import { StyleProp, ViewStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button } from "components/Button";
import { TextDirection, useTextDirection } from "localization";
import { DataEntryActions } from "state/dataEntry";
import { useAppDispatch } from "state/store";

const styleByTextDirection: Record<string, StyleProp<ViewStyle>> = {
  [TextDirection.ltr]: { alignSelf: "flex-start" },
  [TextDirection.rtl]: { alignSelf: "flex-end" },
};

export const NavigateToRecordsListButton = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const textDirection = useTextDirection();

  return (
    <Button
      avoidMultiplePress={false}
      icon="format-list-bulleted"
      onPress={() =>
        dispatch(DataEntryActions.navigateToRecordsList({ navigation }))
      }
      style={styleByTextDirection[textDirection]}
      textKey="dataEntry:listOfRecords"
    />
  );
};
