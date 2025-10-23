// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { NodeDefs, Objects } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'state/survey' or its correspon... Remove this comment to see the full error message
import { SurveySelectors } from "state/survey";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useIsTextDirectionRtl } from "localization";
// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
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
      // @ts-expect-error TS(2552): Cannot find name 'style'. Did you mean 'styles'?
      <HView style={styles.nodeDefLabelContainer}>
        // @ts-expect-error TS(7027): Unreachable code detected.
        <Text style={styles.nodeDefLabel} variant="titleLarge">
          {labelOrName}
        </Text>
        // @ts-expect-error TS(2588): Cannot assign to 'nodeDef' because it is a constan... Remove this comment to see the full error message
        <NodeValidationIcon nodeDef={nodeDef} parentNodeUuid={parentNodeUuid} />
      </HView>
      {!Objects.isEmpty(description) && (
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
