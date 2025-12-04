import { NodeDefs, NodeDefText } from "@openforis/arena-core";

import { Link, Markdown, Text } from "components";
import { DataEntrySelectors } from "state/dataEntry";
import { URLs } from "utils";

import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";

export const NodeTextReadOnlyValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef, value, valueFormatted } = props;

  const cycle = DataEntrySelectors.useRecordCycle();

  const nodeDefText = nodeDef as NodeDefText;

  const isHyperlink = NodeDefs.isLayoutRenderTypeHyperlink(cycle)(nodeDefText);
  const isMarkdown = NodeDefs.isLayoutRenderTypeMarkdown(cycle)(nodeDefText);
  if (isMarkdown) {
    return <Markdown content={value} />;
  }
  if (isHyperlink) {
    return <Link url={URLs.normalizeUrl(value)} />;
  }
  return <Text>{valueFormatted}</Text>;
};
