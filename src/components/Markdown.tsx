import { StyleSheet } from "react-native";
import RNMarkdown from "react-native-markdown-display";

type MarkdownProps = {
  content: string;
  style?: StyleSheet.NamedStyles<any>;
};

export const Markdown = (props: MarkdownProps) => {
  const { content, style } = props;

  return <RNMarkdown style={style}>{content ?? ""}</RNMarkdown>;
};
