import { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";

import { NodeDefs, NodeDefText } from "@openforis/arena-core";

import {
  CopyToClipboardButton,
  HView,
  Link,
  Markdown,
  Text,
  View,
} from "components";
import { DataEntrySelectors } from "state/dataEntry";
import { URLs } from "utils";

import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
});

export const NodeTextReadOnlyValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef, value, valueFormatted } = props;

  const cycle = DataEntrySelectors.useRecordCycle();
  const [normalizedUrl, setNormalizedUrl] = useState<string | null>(null);

  const nodeDefText = nodeDef as NodeDefText;

  const isHyperlink = NodeDefs.isLayoutRenderTypeHyperlink(cycle)(nodeDefText);
  const isMarkdown = NodeDefs.isLayoutRenderTypeMarkdown(cycle)(nodeDefText);

  useEffect(() => {
    const normalizeUrl = async () => {
      const url = await URLs.normalizeUrl("===test.org");
      setNormalizedUrl(url);
    };
    if (isHyperlink) {
      normalizeUrl();
    }
  }, [isHyperlink, value]);

  const internalComponent = useMemo(() => {
    if (isMarkdown) {
      return <Markdown content={value} />;
    }
    if (isHyperlink && normalizedUrl) {
      return <Link url={normalizedUrl} />;
    }
    return <Text>{valueFormatted}</Text>;
  }, [isMarkdown, isHyperlink, normalizedUrl, valueFormatted, value]);

  return (
    <HView style={styles.wrapper}>
      <View style={styles.content}>{internalComponent}</View>
      <CopyToClipboardButton value={valueFormatted} />
    </HView>
  );
};
