import { NodeDefs, Objects } from "@openforis/arena-core";

import { SurveySelectors } from "state/survey";

import { useIsTextDirectionRtl } from "localization";
import { HView, Icon, Text, View, ViewMoreText } from "components";

import { NodeValidationIcon } from "../NodeValidationIcon";
import { useStyles } from "./styles";

type NodeDefFormItemHeaderProps = {
  startAccessory?: React.ReactNode;
  nodeDef: any;
  parentNodeUuid?: string;
};

export const NodeDefFormItemHeader = (props: NodeDefFormItemHeaderProps) => {
  const { startAccessory, nodeDef, parentNodeUuid } = props;

  const isRtl = useIsTextDirectionRtl();
  const styles = useStyles();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  const labelOrName = NodeDefs.getLabelOrName(nodeDef, lang);
  const description = NodeDefs.getDescription(nodeDef, lang);
  const showKeyIcon = NodeDefs.isKey(nodeDef);

  return (
    <>
      <HView
        fullWidth
        style={styles.nodeDefLabelContainer}
        textDirectionAware={false}
      >
        {showKeyIcon && (
          <View style={styles.keyIcon}>
            <Icon size={18} source="key" />
          </View>
        )}
        {startAccessory}
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
