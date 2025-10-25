import { Card as RNPCard } from "react-native-paper";

import { useTranslation } from "localization";

type Props = {
  children?: React.ReactNode;
  titleKey?: string;
};

export const Card = (props: Props) => {
  const { children, titleKey } = props;

  const { t } = useTranslation();

  const title = titleKey ? t(titleKey) : null;
  return (
    <RNPCard>
      {title && <RNPCard.Title title={title} titleVariant="titleMedium" />}
      <RNPCard.Content>{children}</RNPCard.Content>
    </RNPCard>
  );
};
