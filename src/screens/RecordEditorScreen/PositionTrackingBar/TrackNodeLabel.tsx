import { NodeDefs } from "@openforis/arena-core";

import { Text } from "components";
import { SurveySelectors } from "state";

import { useTrackNode } from "./TrackButtons";

export const TrackNodeLabel = ({ nodeUuid }: { nodeUuid: string }) => {
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const { nodeDef } = useTrackNode(nodeUuid);
  if (!nodeDef) return null;
  return (
    <Text variant="bodyMedium">{NodeDefs.getLabelOrName(nodeDef, lang)}</Text>
  );
};
