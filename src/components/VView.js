import React, { useMemo } from "react";

import { View } from "./View";

const baseStyle = { display: "flex", flexDirection: "column" };

export const VView = (props) => {
  const { children, style: styleProp, ...otherProps } = props;

  const style = useMemo(() => [baseStyle, styleProp], [styleProp]);

  return (
    <View style={style} {...otherProps}>
      {children}
    </View>
  );
};

VView.propTypes = View.propTypes;
