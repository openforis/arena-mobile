import { useCallback } from "react";
import PropTypes from "prop-types";

import { Objects } from "@openforis/arena-core";

import { useToast } from "hooks";

import { SystemUtils } from "utils";

import { IconButton } from "./IconButton";

export const CopyToClipboardButton = (props) => {
  const { value } = props;

  const toaster = useToast();

  const onPress = useCallback(() => {
    if (SystemUtils.copyValueToClipboard(value)) {
      toaster("common:textCopiedToClipboard");
    }
  }, []);

  return (
    <IconButton
      disabled={Objects.isEmpty(value)}
      icon="content-copy"
      onPress={onPress}
    />
  );
};

CopyToClipboardButton.propTypes = {
  value: PropTypes.string,
};
