import { Card as RNPCard } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useTranslation } from "localization";

export const Card = (props: any) => {
  const { children, titleKey } = props;

  const { t } = useTranslation();

  const title = titleKey ? t(titleKey) : null;
  // @ts-expect-error TS(2364): The left-hand side of an assignment expression mus... Remove this comment to see the full error message
  return (
    // @ts-expect-error TS(2749): 'RNPCard' refers to a value, but is being used as ... Remove this comment to see the full error message
    <RNPCard>
      // @ts-expect-error TS(7027): Unreachable code detected.
      {title && <RNPCard.Title title={title} titleVariant="titleMedium" />}
      // @ts-expect-error TS(2365): Operator '<' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
      <RNPCard.Content>{children}</RNPCard.Content>
    </RNPCard>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  titleKey: PropTypes.string,
};
