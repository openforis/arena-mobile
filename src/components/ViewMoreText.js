import RNViewMoreText from "react-native-view-more-text";
import PropTypes from "prop-types";

export const ViewMoreText = (props) => {
  const { children, numberOfLines = 2, style, textStyle } = props;
  return (
    <RNViewMoreText
      numberOfLines={numberOfLines}
      style={style}
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
