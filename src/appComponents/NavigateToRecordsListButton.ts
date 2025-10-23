import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";

import { Button } from "components/Button";
import { textDirections, useTextDirection } from "localization";
import { DataEntryActions } from "state/dataEntry";

const styleByTextDirection = {
  [textDirections.ltr]: { alignSelf: "flex-start" },
  [textDirections.rtl]: { alignSelf: "flex-end" },
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
        dispatch(DataEntryActions.navigateToRecordsList({ navigation }))
      }
      style={styleByTextDirection[textDirection]}
      textKey="dataEntry:listOfRecords"
    />
  );
};
