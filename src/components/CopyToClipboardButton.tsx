import { useCallback } from "react";

import { Objects } from "@openforis/arena-core";

import { useToast } from "hooks";

import { SystemUtils } from "utils";

import { IconButton } from "./IconButton";

type Props = {
  value?: string;
};

export const CopyToClipboardButton = (props: Props) => {
  const { value } = props;

  const toaster = useToast();

  const onPress = useCallback(() => {
    if (SystemUtils.copyValueToClipboard(value)) {
      toaster("common:textCopiedToClipboard");
    }
  }, [toaster, value]);

  return (
    <IconButton
      disabled={Objects.isEmpty(value)}
      icon="content-copy"
      onPress={onPress}
    />
  );
};
