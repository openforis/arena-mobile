import { Card as RNPCard } from "react-native-paper";
import PropTypes from "prop-types";

import { useTranslation } from "localization";

export const Card = (props) => {
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

Card.propTypes = {
  children: PropTypes.node,
  titleKey: PropTypes.string,
};
