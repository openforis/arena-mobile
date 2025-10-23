import { useCallback } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { Objects } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'hooks' or its corresponding ty... Remove this comment to see the full error message
import { useToast } from "hooks";

// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { SystemUtils } from "utils";

import { IconButton } from "./IconButton";

export const CopyToClipboardButton = (props: any) => {
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

CopyToClipboardButton.propTypes = {
  value: PropTypes.string,
};
