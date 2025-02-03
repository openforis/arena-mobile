import PropTypes from "prop-types";

import { NodeDefs } from "@openforis/arena-core";

import { Button, HView } from "components";
import { useIsTextDirectionRtl } from "localization";
import { SurveyDefs } from "model";
import { SurveySelectors } from "state";

import styles from "./styles";

const OpenDropdownButton = (props) => {
  const { onPress, textKey = "dataEntry:code.selectItem", textParams } = props;

  const isRtl = useIsTextDirectionRtl();
  const iconPosition = isRtl ? "left" : "right";

  return (
    <Button
      icon="chevron-down"
      iconPosition={iconPosition}
      textKey={textKey}
      textParams={textParams}
      onPress={onPress}
      style={styles.openDropdownButton}
    />
  );
};

OpenDropdownButton.propTypes = {
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
            onPress={openEditDialog}
            textParams={{ count: 2 }}
          />
        </>
      ) : (
        <OpenDropdownButton
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
