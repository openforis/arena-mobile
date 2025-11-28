import { useMemo } from "react";
import { useTheme } from "react-native-paper";

import { NodeDefs } from "@openforis/arena-core";

import { Button, HView } from "components";
import { useIsTextDirectionRtl } from "localization";
import { SurveyDefs } from "model";
import { SurveySelectors } from "state";

import styles from "./styles";

const useSelectedItemStyleAndTextColor = () => {
  const theme = useTheme();
  return useMemo(() => {
    const style = { backgroundColor: theme.colors.secondary };
    const textColor = theme.colors.onSecondary;
    return { style, textColor };
  }, [theme.colors.secondary, theme.colors.onSecondary]);
};

type OpenDropdownButtonProps = {
  emptySelection?: boolean;
  multiple: boolean;
  onPress: () => void;
  textIsI18nKey?: boolean;
  textKey?: string;
  textParams?: any;
};

const OpenDropdownButton = (props: OpenDropdownButtonProps) => {
  const {
    emptySelection = false,
    multiple = false,
    onPress,
    textIsI18nKey = true,
    textKey = "dataEntry:code.selectItem",
    textParams,
  } = props;

  const isRtl = useIsTextDirectionRtl();
  const iconPosition = isRtl ? "left" : "right";
  const { style: selectedItemStyle, textColor: selectedItemTextColor } =
    useSelectedItemStyleAndTextColor();

  const showAsSelected = !emptySelection && !multiple;

  const { style, textColor } = useMemo(() => {
    const selectionStyle = showAsSelected ? selectedItemStyle : undefined;
    return {
      style: [styles.openDropdownButton, selectionStyle],
      textColor: showAsSelected ? selectedItemTextColor : undefined,
    };
  }, [showAsSelected, selectedItemStyle, selectedItemTextColor]);

  return (
    <Button
      color={!emptySelection && multiple ? "secondary" : undefined}
      icon="chevron-down"
      iconPosition={iconPosition}
      onPress={onPress}
      style={style}
      textColor={textColor}
      textIsI18nKey={textIsI18nKey}
      textKey={textKey}
      textParams={textParams}
    />
  );
};

type NodeCodePreviewProps = {
  itemLabelFunction: (item: any) => string;
  nodeDef: any;
  openEditDialog: () => void;
  openFindClosestSamplingPointDialog: () => void;
  selectedItems?: any[];
};

export const NodeCodePreview = (props: NodeCodePreviewProps) => {
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

  const selectedItemLabel =
    !multiple && selectedItems.length === 1
      ? itemLabelFunction(selectedItems[0])
      : null;

  const { style: selectedItemStyle, textColor: selectedItemTextColor } =
    useSelectedItemStyleAndTextColor();

  return (
    <HView style={styles.container}>
      {multiple ? (
        <>
          {selectedItems.map((item: any) => (
            <Button
              key={item.uuid}
              color="secondary"
              onPress={openEditDialog}
              style={[styles.previewItem, selectedItemStyle]}
              textColor={selectedItemTextColor}
            >
              {itemLabelFunction(item)}
            </Button>
          ))}
          <OpenDropdownButton
            emptySelection={emptySelection}
            multiple={multiple}
            onPress={openEditDialog}
            textParams={{ count: 2 }}
          />
        </>
      ) : (
        <OpenDropdownButton
          emptySelection={emptySelection}
          multiple={multiple}
          onPress={openEditDialog}
          textIsI18nKey={emptySelection}
          textKey={emptySelection ? undefined : selectedItemLabel!}
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
