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

export const BottomNavigationBar = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const textDirection = useTextDirection();
  const prevButtonIcon = prevIconByTextDirection[textDirection];
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
    dispatch(DataEntryActions.addNewEntity);
  }, [dispatch]);

  return (
    <HView style={styles.container}>
      <View style={styles.buttonContainer} transparent>
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
