import { ArenaNodeDef, NodeDefType } from "@openforis/arena-core";

import { RecordAttributeValues } from "./RecordAttributeValues";

const { cleanupAttributeValue, extractDistanceTargetExpression } =
  RecordAttributeValues;

const coordinateDef = (props: Record<string, unknown> = {}) =>
  ({
    type: NodeDefType.coordinate,
    props: { name: "location", ...props },
  }) as unknown as ArenaNodeDef<NodeDefType>;

const defWithValidation = (expression: string) =>
  ({
    type: NodeDefType.coordinate,
    props: { name: "site_location" },
    propsAdvanced: { validations: { expressions: [{ expression }] } },
  }) as unknown as ArenaNodeDef<NodeDefType>;

describe("RecordAttributeValues.cleanupAttributeValue", () => {
  test("removes extra coordinate fields and converts numbers", () => {
    const value = { x: "12.5", y: 41, srs: "4326", accuracy: 3, foo: "bar" };
    const cleaned = cleanupAttributeValue({
      value,
      attributeDef: coordinateDef(),
    });
    expect(cleaned).toEqual({ x: 12.5, y: 41, srs: "4326" });
    // no side effect by default
    expect(value.foo).toBe("bar");
  });

  test("keeps additional fields included in the node def", () => {
    const cleaned = cleanupAttributeValue({
      value: { x: 1, y: 2, srs: "4326", accuracy: "3" },
      attributeDef: coordinateDef({ includeAccuracy: true }),
    });
    expect(cleaned).toEqual({ x: 1, y: 2, srs: "4326", accuracy: 3 });
  });

  test("updates the value in place with sideEffect", () => {
    const value: Record<string, unknown> = { x: 1, y: 2, srs: "4326", z: 0 };
    cleanupAttributeValue({
      value,
      attributeDef: coordinateDef(),
      sideEffect: true,
    });
    expect(value).toEqual({ x: 1, y: 2, srs: "4326" });
  });

  test("other attribute values are returned as they are", () => {
    const value = { foo: "bar" };
    const attributeDef = {
      type: NodeDefType.text,
      props: {},
    } as unknown as ArenaNodeDef<NodeDefType>;
    expect(cleanupAttributeValue({ value, attributeDef })).toBe(value);
  });
});

describe("RecordAttributeValues.extractDistanceTargetExpression", () => {
  test.each([
    ["distance(this, unit_location) <= 100", "unit_location"],
    ["geoDistance(unit_location, site_location) < 5", "unit_location"],
    [
      "distance(this, categoryItemProp('plots', 'location', plot_id)) < 5",
      "categoryItemProp('plots', 'location', plot_id)",
    ],
    ["distance(parent(this).location, this) < 5", null],
  ])("%s", (expression, expected) => {
    expect(
      extractDistanceTargetExpression({
        nodeDef: defWithValidation(expression),
      }),
    ).toBe(expected);
  });

  test("no distance validation", () => {
    expect(
      extractDistanceTargetExpression({
        nodeDef: defWithValidation("this != null"),
      }),
    ).toBeNull();
  });
});
