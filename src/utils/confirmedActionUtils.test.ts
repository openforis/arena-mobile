import { runConfirmedAction } from "./confirmedActionUtils";

describe("runConfirmedAction", () => {
  it("does not run the action when not confirmed", async () => {
    const action = jest.fn();
    const setRunning = jest.fn();
    const result = await runConfirmedAction({
      confirm: async () => false,
      action,
      setRunning,
    });
    expect(result).toBe(false);
    expect(action).not.toHaveBeenCalled();
    expect(setRunning).not.toHaveBeenCalled();
  });

  it("runs the action when confirmed, toggling the running flag", async () => {
    const calls: string[] = [];
    const result = await runConfirmedAction({
      confirm: async () => true,
      action: async () => {
        calls.push("action");
      },
      setRunning: (running) => calls.push(`running:${running}`),
    });
    expect(result).toBe(true);
    expect(calls).toEqual(["running:true", "action", "running:false"]);
  });

  it("resets the running flag and rethrows when the action fails", async () => {
    const error = new Error("action error");
    const setRunning = jest.fn();
    await expect(
      runConfirmedAction({
        confirm: async () => true,
        action: async () => {
          throw error;
        },
        setRunning,
      }),
    ).rejects.toBe(error);
    expect(setRunning).toHaveBeenLastCalledWith(false);
  });
});
