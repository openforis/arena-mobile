import React from "react";
import { Searchbar as RNPSearchbar } from "react-native-paper";

import { useTranslation } from "localization";

const baseStyle = { margin: 5 };

type Props = {
  placeholder?: string;
  onChange: (value: string) => void;
  value?: any;
};

export const Searchbar = (props: Props) => {
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
