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
    // @ts-expect-error TS(2709): Cannot use namespace 'Button' as a type.
    <Button
      // @ts-expect-error TS(2304): Cannot find name 'avoidMultiplePress'.
      avoidMultiplePress={false}
      // @ts-expect-error TS(7027): Unreachable code detected.
      icon="format-list-bulleted"
      // @ts-expect-error TS(2304): Cannot find name 'onPress'.
      onPress={() =>
        // @ts-expect-error TS(2304): Cannot find name 'dispatch'.
        dispatch(DataEntryActions.navigateToRecordsList({ navigation }))
      }
      // @ts-expect-error TS(2304): Cannot find name 'style'.
      style={styleByTextDirection[textDirection]}
      // @ts-expect-error TS(2304): Cannot find name 'textKey'.
      textKey="dataEntry:listOfRecords"
    />
  );
};
