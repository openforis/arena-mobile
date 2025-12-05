import { NodeDefs, NodeDefText } from "@openforis/arena-core";

import { Link, Markdown, Text } from "components";
import { DataEntrySelectors } from "state/dataEntry";
import { URLs } from "utils";

import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";
import { useEffect, useState } from "react";

export const NodeTextReadOnlyValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef, value, valueFormatted } = props;

  const cycle = DataEntrySelectors.useRecordCycle();
  const [normalizedUrl, setNormalizedUrl] = useState<string | null>(null);

  const nodeDefText = nodeDef as NodeDefText;

  const isHyperlink = NodeDefs.isLayoutRenderTypeHyperlink(cycle)(nodeDefText);
  const isMarkdown = NodeDefs.isLayoutRenderTypeMarkdown(cycle)(nodeDefText);

  useEffect(() => {
    const normalizeUrl = async () => {
      const url = await URLs.normalizeUrl(value);
      setNormalizedUrl(url);
    };
    if (isHyperlink) {
      normalizeUrl();
    }
  }, [isHyperlink, value]);

  if (isMarkdown) {
    return <Markdown content={value} />;
  }
  if (isHyperlink && normalizedUrl) {
    return <Link url={normalizedUrl} />;
  }
  return <Text>{valueFormatted}</Text>;
};
