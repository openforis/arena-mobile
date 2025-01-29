import React from "react";
import { Searchbar as RNPSearchbar } from "react-native-paper";
import PropTypes from "prop-types";

import { useTranslation } from "localization";

const baseStyle = { margin: 5 };

export const Searchbar = (props) => {
  const {
    placeholder: placeholderProp = "common:search",
    onChange,
    value,
  } = props;

  const { t } = useTranslation();

  return (
    <RNPSearchbar
      placeholder={t(placeholderProp)}
      onChangeText={onChange}
      style={baseStyle}
      value={value}
    />
  );
};

Searchbar.propTypes = {
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
};
