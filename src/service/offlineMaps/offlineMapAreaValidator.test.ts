import { OfflineMapArea } from "model/OfflineMapArea";

import { OfflineMapAreaValidator } from "./offlineMapAreaValidator";

const { nameErrorKeys, validateName } = OfflineMapAreaValidator;

const createArea = (id: string, name: string): OfflineMapArea =>
  ({ id, name }) as OfflineMapArea;

const areas = [createArea("1", "Area A"), createArea("2", "Area B")];

describe("OfflineMapAreaValidator", () => {
  describe("validateName", () => {
    it("returns null for a name not in use", () => {
      expect(validateName({ name: "Area C", areas })).toBeNull();
    });

    it("requires a non blank name", () => {
      expect(validateName({ name: "", areas })).toBe(nameErrorKeys.required);
      expect(validateName({ name: "   ", areas })).toBe(nameErrorKeys.required);
    });

    it("detects names already in use, ignoring case and spaces", () => {
      expect(validateName({ name: "Area A", areas })).toBe(
        nameErrorKeys.duplicate,
      );
      expect(validateName({ name: "  area a ", areas })).toBe(
        nameErrorKeys.duplicate,
      );
    });

    it("does not compare the area being renamed with itself", () => {
      expect(validateName({ name: "Area A", areas, areaId: "1" })).toBeNull();
      expect(validateName({ name: "Area B", areas, areaId: "1" })).toBe(
        nameErrorKeys.duplicate,
      );
    });
  });
});
