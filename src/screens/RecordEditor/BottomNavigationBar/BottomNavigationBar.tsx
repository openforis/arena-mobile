import React, { useCallback } from "react";
import { useDispatch } from "react-redux";

import { NodeDefs } from "@openforis/arena-core";

import { NavigateToRecordsListButton } from "appComponents/NavigateToRecordsListButton";
import { HView, IconButton, View } from "components";
import { textDirections, useTextDirection } from "localization";
import { DataEntryActions, DataEntrySelectors } from "state";

import { NodePageNavigationButton } from "./NodePageNavigationButton";
import { SingleNodeNavigationButton } from "./SingleNodeNavigationButton";
import { useBottomNavigationBar } from "./useBottomNavigationBar";

import { useStyles } from "./styles";

const { ltr, rtl } = textDirections;

const prevIconByTextDirection = {
  [ltr]: "chevron-left",
  [rtl]: "chevron-right",
};

const prevButtonIconPositionByTextDirection = {
  [ltr]: "left",
  [rtl]: "right",
};

const nextIconByTextDirection = {
  [ltr]: "chevron-right",
  [rtl]: "chevron-left",
};

const nextButtonIconPositionByTextDirection = {
  [ltr]: "right",
  [rtl]: "left",
};

// Delay the dispatch to allow current attribute update to complete)
const entityCreationDelay = 500;

export const BottomNavigationBar = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const textDirection = useTextDirection();
  const prevButtonIconPosition =
    prevButtonIconPositionByTextDirection[textDirection];
  const prevButtonStyle =
    textDirection === ltr ? styles.leftButton : styles.rightButton;
  const nextButtonIcon = nextIconByTextDirection[textDirection];
  const nextButtonIconPosition =
    nextButtonIconPositionByTextDirection[textDirection];
  const nextButtonStyle =
    textDirection === ltr ? styles.rightButton : styles.leftButton;

  const currentEntityPointer = DataEntrySelectors.useCurrentPageEntity();
  const { entityDef } = currentEntityPointer;

  if (__DEV__) {
    console.log(
      `rendering BottomNavigationBar for ${NodeDefs.getName(entityDef)}`
    );
  }
  const {
    activeChildIndex,
    listOfRecordsButtonVisible,
    newButtonVisible,
    nextEntityPointer,
    nextPageButtonVisible,
    nextSingleNodeButtonVisible,
    prevEntityPointer,
    prevPageButtonVisible,
    prevSingleNodeButtonVisible,
  } = useBottomNavigationBar();

  const onNewPress = useCallback(() => {
    // @ts-expect-error TS(2345): Argument of type '(dispatch: any) => Promise<void>... Remove this comment to see the full error message
    dispatch(DataEntryActions.addNewEntity({ delay: entityCreationDelay }));
  }, [dispatch]);

  const prevButtonGoesToList =
    prevEntityPointer?.entityDef === entityDef && !prevEntityPointer.entityUuid;
  const prevButtonIcon = prevButtonGoesToList
    ? "format-list-bulleted"
    : prevIconByTextDirection[textDirection];

  return (
    <HView style={styles.container}>
      <View style={styles.buttonContainer} transparent>
        // @ts-expect-error TS(2786): 'NavigateToRecordsListButton' cannot be used as a ... Remove this comment to see the full error message
        {listOfRecordsButtonVisible && <NavigateToRecordsListButton />}

        {prevPageButtonVisible && (
          <NodePageNavigationButton
            icon={prevButtonIcon}
            iconPosition={prevButtonIconPosition}
            entityPointer={prevEntityPointer}
            style={prevButtonStyle}
          />
        )}
        {prevSingleNodeButtonVisible && (
          <SingleNodeNavigationButton
            icon={prevButtonIcon}
            iconPosition={prevButtonIconPosition}
            childDefIndex={activeChildIndex - 1}
            style={prevButtonStyle}
          />
        )}
      </View>

      {newButtonVisible && (
        <IconButton
          avoidMultiplePress
          icon="plus"
          mode="contained"
          multiplePressAvoidanceTimeout={entityCreationDelay + 200}
          onPress={onNewPress}
          selected
        />
      )}

      <View style={styles.buttonContainer} transparent>
        {nextPageButtonVisible && (
          <NodePageNavigationButton
            icon={nextButtonIcon}
            iconPosition={nextButtonIconPosition}
            entityPointer={nextEntityPointer}
            style={nextButtonStyle}
          />
        )}
        {nextSingleNodeButtonVisible && (
          <SingleNodeNavigationButton
            icon={nextButtonIcon}
            iconPosition={nextButtonIconPosition}
            childDefIndex={activeChildIndex + 1}
            style={nextButtonStyle}
          />
        )}
      </View>
    </HView>
  );
};
