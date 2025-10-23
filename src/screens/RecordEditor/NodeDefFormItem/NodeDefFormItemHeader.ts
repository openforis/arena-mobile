// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { NodeDefs, Objects } from "@openforis/arena-core";

import { SurveySelectors } from "state/survey";

import { useIsTextDirectionRtl } from "localization";
import { HView, Text, ViewMoreText } from "components";

import { NodeValidationIcon } from "../NodeValidationIcon";
import { useStyles } from "./styles";

export const NodeDefFormItemHeader = (props: any) => {
  const { nodeDef, parentNodeUuid } = props;

  const isRtl = useIsTextDirectionRtl();
  const styles = useStyles();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  const labelOrName = NodeDefs.getLabelOrName(nodeDef, lang);
  const description = NodeDefs.getDescription(nodeDef, lang);

  return (
    <>
      // @ts-expect-error TS(2709): Cannot use namespace 'HView' as a type.
      <HView style={styles.nodeDefLabelContainer}>
        // @ts-expect-error TS(7027): Unreachable code detected.
        <Text style={styles.nodeDefLabel} variant="titleLarge">
          {labelOrName}
        </Text>
        // @ts-expect-error TS(2588): Cannot assign to 'nodeDef' because it is a constan... Remove this comment to see the full error message
        <NodeValidationIcon nodeDef={nodeDef} parentNodeUuid={parentNodeUuid} />
      </HView>
      {!Objects.isEmpty(description) && (
        // @ts-expect-error TS(2709): Cannot use namespace 'ViewMoreText' as a type.
        <ViewMoreText
          // @ts-expect-error TS(2304): Cannot find name 'textStyle'.
          textStyle={
            isRtl
              ? styles.nodeDefDescriptionViewMoreTextRtl
              : styles.nodeDefDescriptionViewMoreText
          }
        >
          // @ts-expect-error TS(2552): Cannot find name 'style'. Did you mean 'styles'?
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
