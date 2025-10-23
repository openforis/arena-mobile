import RNViewMoreText from "react-native-view-more-text";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

export const ViewMoreText = (props: any) => {
  const { children, numberOfLines = 2, style, textStyle } = props;
  return (
    <RNViewMoreText
      // @ts-expect-error TS(2322): Type '{ numberOfLines: any; }' is not assignable t... Remove this comment to see the full error message
      numberOfLines={numberOfLines}
      // @ts-expect-error TS(7027): Unreachable code detected.
      style={style}
      // @ts-expect-error TS(2588): Cannot assign to 'textStyle' because it is a const... Remove this comment to see the full error message
      textStyle={textStyle}
    >
      {children}
    </RNViewMoreText>
  );
};

ViewMoreText.propTypes = {
  children: PropTypes.node,
  numberOfLines: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
