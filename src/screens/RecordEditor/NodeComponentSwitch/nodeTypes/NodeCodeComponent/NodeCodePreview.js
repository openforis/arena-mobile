import { useMemo } from "react";
import { useTheme } from "react-native-paper";
import PropTypes from "prop-types";

import { NodeDefs } from "@openforis/arena-core";

import { Button, HView } from "components";
import { useIsTextDirectionRtl } from "localization";
import { SurveyDefs } from "model";
import { SurveySelectors } from "state";

import styles from "./styles";

const OpenDropdownButton = (props) => {
  const {
    emptySelection = false,
    onPress,
    textKey = "dataEntry:code.selectItem",
    textParams,
  } = props;

  const isRtl = useIsTextDirectionRtl();
  const iconPosition = isRtl ? "left" : "right";
  const theme = useTheme();

  const { style, textColor } = useMemo(() => {
    const selectionStyle = emptySelection
      ? undefined
      : { backgroundColor: theme.colors.secondary };
    return {
      style: [styles.openDropdownButton, selectionStyle],
      textColor: emptySelection ? undefined : theme.colors.onSecondary,
    };
  }, [emptySelection, theme.colors.onSecondary, theme.colors.secondary]);

  return (
    <Button
      icon="chevron-down"
      iconPosition={iconPosition}
      textKey={textKey}
      textParams={textParams}
      onPress={onPress}
      style={style}
      textColor={textColor}
    />
  );
};

OpenDropdownButton.propTypes = {
  emptySelection: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  textKey: PropTypes.string,
  textParams: PropTypes.object,
};

export const NodeCodePreview = (props) => {
  const {
    itemLabelFunction,
    nodeDef,
    openEditDialog,
    openFindClosestSamplingPointDialog,
    selectedItems = [],
  } = props;

  const survey = SurveySelectors.useCurrentSurvey();

  const multiple = NodeDefs.isMultiple(nodeDef);
  const canFindClosestSamplingPointData =
    SurveyDefs.isCodeAttributeFromSamplingPointData({ survey, nodeDef }) &&
    SurveyDefs.hasSamplingPointDataLocation(survey);
  const emptySelection = selectedItems.length === 0;

  return (
    <HView style={{ flexWrap: "wrap" }}>
      {multiple ? (
        <>
          {selectedItems.map((item) => (
            <Button
              key={item.uuid}
              color="secondary"
              onPress={openEditDialog}
              style={styles.previewItem}
            >
              {itemLabelFunction(item)}
            </Button>
          ))}
          <OpenDropdownButton
            emptySelection={emptySelection}
            onPress={openEditDialog}
            textParams={{ count: 2 }}
          />
        </>
      ) : (
        <OpenDropdownButton
          emptySelection={emptySelection}
          onPress={openEditDialog}
          textKey={
            selectedItems.length === 1
              ? itemLabelFunction(selectedItems[0])
              : "dataEntry:code.selectItem"
          }
        />
      )}
      {canFindClosestSamplingPointData && (
        <Button
          color="secondary"
          onPress={openFindClosestSamplingPointDialog}
          textKey="dataEntry:closestSamplingPoint.findClosestSamplingPoint"
        />
      )}
    </HView>
  );
};

NodeCodePreview.propTypes = {
  itemLabelFunction: PropTypes.func.isRequired,
  nodeDef: PropTypes.object.isRequired,
  openEditDialog: PropTypes.func.isRequired,
  openFindClosestSamplingPointDialog: PropTypes.func.isRequired,
  selectedItems: PropTypes.array,
};
