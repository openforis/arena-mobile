import { StyleProp, ViewStyle } from "react-native";
import { useNavigator } from "navigation/navigator";

import { Button } from "components/Button";
import { TextDirection, useTextDirection } from "localization";
import { DataEntryActions } from "state/dataEntry";
import { useAppDispatch } from "state/storeHooks";

const styleByTextDirection: Record<string, StyleProp<ViewStyle>> = {
  [TextDirection.ltr]: { alignSelf: "flex-start" },
  [TextDirection.rtl]: { alignSelf: "flex-end" },
};

export const NavigateToRecordsListButton = () => {
  const dispatch = useAppDispatch();
  const navigator = useNavigator();
  const textDirection = useTextDirection();

  return (
    <Button
      avoidMultiplePress={false}
      icon="format-list-bulleted"
      onPress={() =>
        dispatch(DataEntryActions.navigateToRecordsList({ navigator }))
      }
      style={styleByTextDirection[textDirection]}
      textKey="dataEntry:listOfRecords"
    />
  );
};
