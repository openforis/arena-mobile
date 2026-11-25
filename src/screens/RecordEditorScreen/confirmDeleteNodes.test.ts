import { confirmDeleteNodes } from "./confirmDeleteNodes";

const nodeUuids = ["node1", "node2"];
const messageKey = "dataEntry:confirmDeleteSelectedItems.message";

describe("confirmDeleteNodes", () => {
  test("deletes the nodes when confirmed", async () => {
    const confirm = jest.fn().mockResolvedValue(true);
    const deleteNodes = jest.fn();
    await expect(
      confirmDeleteNodes({ confirm, deleteNodes, messageKey, nodeUuids }),
    ).resolves.toBe(true);
    expect(confirm).toHaveBeenCalledWith({ messageKey });
    expect(deleteNodes).toHaveBeenCalledWith(nodeUuids);
  });

  test("does not delete the nodes when not confirmed", async () => {
    const confirm = jest.fn().mockResolvedValue(null);
    const deleteNodes = jest.fn();
    await expect(
      confirmDeleteNodes({ confirm, deleteNodes, messageKey, nodeUuids }),
    ).resolves.toBe(false);
    expect(deleteNodes).not.toHaveBeenCalled();
  });

  test("deletes the nodes without asking when confirmation is skipped", async () => {
    const confirm = jest.fn();
    const deleteNodes = jest.fn();
    await expect(
      confirmDeleteNodes({
        confirm,
        deleteNodes,
        messageKey,
        nodeUuids,
        skipConfirm: true,
      }),
    ).resolves.toBe(true);
    expect(confirm).not.toHaveBeenCalled();
    expect(deleteNodes).toHaveBeenCalledWith(nodeUuids);
  });
});
