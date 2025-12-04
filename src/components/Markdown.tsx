import RNMarkdown from "react-native-markdown-display";

type MarkdownProps = {
  content: string;
  style?: any;
};

export const Markdown = (props: MarkdownProps) => {
  const { content, style } = props;
  return <RNMarkdown style={style}>{content}</RNMarkdown>;
};
