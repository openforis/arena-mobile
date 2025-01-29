import PropTypes from "prop-types";

import { NodeDefs, Objects } from "@openforis/arena-core";

import { SurveySelectors } from "state/survey";

import { useIsTextDirectionRtl } from "localization";
import { HView, Text, ViewMoreText } from "components";

import { NodeValidationIcon } from "../NodeValidationIcon";
import { useStyles } from "./styles";

export const NodeDefFormItemHeader = (props) => {
  const { nodeDef, parentNodeUuid } = props;

  const isRtl = useIsTextDirectionRtl();
  const styles = useStyles();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  const labelOrName = NodeDefs.getLabelOrName(nodeDef, lang);
  const description = NodeDefs.getDescription(nodeDef, lang);

  return (
    <>
      <HView style={styles.nodeDefLabelContainer}>
        <Text style={styles.nodeDefLabel} variant="titleLarge">
          {labelOrName}
        </Text>
        <NodeValidationIcon nodeDef={nodeDef} parentNodeUuid={parentNodeUuid} />
      </HView>
      {!Objects.isEmpty(description) && (
        <ViewMoreText
          textStyle={
            isRtl
              ? styles.nodeDefDescriptionViewMoreTextRtl
              : styles.nodeDefDescriptionViewMoreText
          }
        >
          <Text style={styles.nodeDefDescriptionText}>{description}</Text>
        </ViewMoreText>
      )}
    </>
  );
};

NodeDefFormItemHeader.propTypes = {
  nodeDef: PropTypes.object.isRequired,
  parentNodeUuid: PropTypes.string,
};
