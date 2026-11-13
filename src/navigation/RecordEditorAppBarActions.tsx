import { useCallback } from "react";

import { AutoSyncStatusAppBarAction } from "appComponents/AutoSyncStatus";
import { AppBarAction, Spacer } from "components";
import { RecordEditViewMode } from "model";
import { PreviewMode } from "utils";
import { Breadcrumbs } from "screens/RecordEditor/Breadcrumbs";
import {
  DataEntryActions,
  DataEntrySelectors,
  SurveyOptionsActions,
  SurveyOptionsSelectors,
  useAppDispatch,
} from "state";

import type { Navigator } from "./navigator";

type Props = {
  isInTwoRows: boolean;
  isTablet: boolean;
  navigator: Navigator;
};

// rendered only in the record editor: the headers of the other screens don't subscribe to the record state
export const RecordEditorAppBarActions = (props: Props) => {
  const { isInTwoRows, isTablet, navigator } = props;

  const dispatch = useAppDispatch();
  const recordEditLockAvailable =
    DataEntrySelectors.useRecordEditLockAvailable();
  const recordEditLocked = DataEntrySelectors.useRecordEditLocked();
  const recordEditViewMode = SurveyOptionsSelectors.useRecordEditViewMode();
  const recordIsNotValid = DataEntrySelectors.useRecordIsNotValid();
  const recordHasErrors = DataEntrySelectors.useRecordHasErrors();
  const canRecordBeLinkedToPreviousCycle =
    DataEntrySelectors.useCanRecordBeLinkedToPreviousCycle();
  const isLinkedToPreviousCycleRecord =
    DataEntrySelectors.useIsLinkedToPreviousCycleRecord();
  const isLoadingPreviousCycleRecord =
    DataEntrySelectors.usePreviousCycleRecordLoading();

  const toggleRecordLock = useCallback(
    () => dispatch(DataEntryActions.toggleRecordEditLock),
    [dispatch],
  );

  const toggleRecordEditViewMode = useCallback(() => {
    dispatch(
      SurveyOptionsActions.setRecordEditViewMode(
        recordEditViewMode === RecordEditViewMode.form
          ? RecordEditViewMode.oneNode
          : RecordEditViewMode.form,
      ),
    );
  }, [dispatch, recordEditViewMode]);

  const onValidationIconPress = useCallback(
    () => navigator.navigateToRecordValidationReport(),
    [navigator],
  );

  const onLinkToPreviousCyclePress = useCallback(() => {
    dispatch(
      isLinkedToPreviousCycleRecord
        ? DataEntryActions.unlinkFromRecordInPreviousCycle()
        : DataEntryActions.linkToRecordInPreviousCycle(),
    );
  }, [dispatch, isLinkedToPreviousCycleRecord]);

  return (
    <>
      {!isInTwoRows && <Breadcrumbs />}
      {!isTablet && isInTwoRows && <Spacer fullFlex fullWidth={false} />}
      {recordEditLockAvailable && (
        <AppBarAction
          icon={recordEditLocked ? "lock-outline" : "lock-open-variant-outline"}
          onPress={toggleRecordLock}
          testID="app-bar-record-lock-button"
        />
      )}
      {recordIsNotValid && (
        <AppBarAction
          icon="alert"
          color={recordHasErrors ? "red" : "orange"}
          onPress={onValidationIconPress}
          testID="app-bar-validation-button"
        />
      )}
      {canRecordBeLinkedToPreviousCycle && (
        <AppBarAction
          icon={isLinkedToPreviousCycleRecord ? "link" : "link-off"}
          loading={isLoadingPreviousCycleRecord}
          onPress={onLinkToPreviousCyclePress}
          testID="app-bar-previous-cycle-link-button"
        />
      )}
      <AppBarAction
        icon={
          recordEditViewMode === RecordEditViewMode.form
            ? "numeric-1-box-outline"
            : "format-list-bulleted"
        }
        onPress={toggleRecordEditViewMode}
        testID="app-bar-record-view-mode-button"
      />
      {!PreviewMode.isActive && <AutoSyncStatusAppBarAction />}
    </>
  );
};
