import { WhatsNew } from "./WhatsNew";

const [first, second] = WhatsNew.items;

describe("WhatsNew", () => {
  test("getUnseenItems excludes the items already seen", () => {
    const unseen = WhatsNew.getUnseenItems([first!.id]);
    expect(unseen.map((item) => item.id)).not.toContain(first!.id);
    expect(unseen).toHaveLength(WhatsNew.items.length - 1);
  });

  test("mergeSeenIds adds the seen items and drops ids not in the catalog", () => {
    const merged = WhatsNew.mergeSeenIds(["removedItem", first!.id], [second!]);
    expect(merged.sort()).toEqual([first!.id, second!.id].sort());
  });

  test("item ids are unique", () => {
    const ids = WhatsNew.items.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
