import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";

// @ts-expect-error TS(2307): Cannot find module 'components/Button' or its corr... Remove this comment to see the full error message
import { Button } from "components/Button";
// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { textDirections, useTextDirection } from "localization";
// @ts-expect-error TS(2307): Cannot find module 'state/dataEntry' or its corres... Remove this comment to see the full error message
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
