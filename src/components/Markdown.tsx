import { StyleSheet } from "react-native";
import RNMarkdown from "react-native-markdown-display";

export type MarkdownStyle = StyleSheet.NamedStyles<any>;

type MarkdownProps = {
  content: string;
  style?: MarkdownStyle;
};

export const Markdown = (props: MarkdownProps) => {
  const { content, style } = props;

  return <RNMarkdown style={style}>{content ?? ""}</RNMarkdown>;
};
