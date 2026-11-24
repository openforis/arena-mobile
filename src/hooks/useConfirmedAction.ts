import { useCallback, useState } from "react";

import type { ConfirmShowParams } from "state/confirm";
import { useConfirm } from "state/confirm/hooks";

import { runConfirmedAction } from "./confirmedActionUtils";

// asks for confirmation, then runs the action tracking its running state; resolves to true if confirmed
export const useConfirmedAction = () => {
  const confirm = useConfirm();
  const [running, setRunning] = useState(false);

  const confirmAndRun = useCallback(
    (
      confirmParams: Omit<ConfirmShowParams, "onConfirm" | "onCancel">,
      action: () => Promise<unknown>,
    ): Promise<boolean> =>
      runConfirmedAction({
        confirm: () => confirm(confirmParams),
        action,
        setRunning,
      }),
    [confirm],
  );

  return { confirmAndRun, running };
};
