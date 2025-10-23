import React from "react";
import { Searchbar as RNPSearchbar } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { useTranslation } from "localization";

const baseStyle = { margin: 5 };

export const Searchbar = (props: any) => {
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
