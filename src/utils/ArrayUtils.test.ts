import { Sort, SortObject } from "model/Sort";

import { ArrayUtils } from "./ArrayUtils";

const { findByUuid, indexByUuid, sortByProps } = ArrayUtils;

const sorted = <T extends object>(array: T[], sortObj: SortObject) => {
  const copy = [...array];
  sortByProps(sortObj)(copy);
  return copy;
};

describe("ArrayUtils.findByUuid / indexByUuid", () => {
  const items = [
    { uuid: "a", v: 1 },
    { uuid: "b", v: 2 },
  ];

  test("findByUuid", () => {
    expect(findByUuid("b")(items)).toBe(items[1]);
    expect(findByUuid("x")(items)).toBeUndefined();
    expect(findByUuid("a")([])).toBeUndefined();
  });

  test("indexByUuid", () => {
    expect(indexByUuid(items)).toEqual({ a: items[0], b: items[1] });
    expect(indexByUuid([])).toEqual({});
  });
});

describe("ArrayUtils.sortByProps", () => {
  test("sorts numbers asc and desc, in place", () => {
    const array = [{ n: 3 }, { n: 1 }, { n: 2 }];
    sortByProps({ n: Sort.asc })(array);
    expect(array.map((i) => i.n)).toEqual([1, 2, 3]);
    expect(sorted(array, { n: Sort.desc }).map((i) => i.n)).toEqual([3, 2, 1]);
  });

  test("zero is not treated as empty", () => {
    const array = [{ n: 2 }, { n: 0 }, { n: -1 }];
    expect(sorted(array, { n: Sort.asc }).map((i) => i.n)).toEqual([-1, 0, 2]);
  });

  test("sorts strings with localeCompare", () => {
    const array = [{ s: "b" }, { s: "C" }, { s: "a" }];
    expect(sorted(array, { s: Sort.asc }).map((i) => i.s)).toEqual([
      "a",
      "b",
      "C",
    ]);
  });

  test("sorts display dates chronologically, not lexically", () => {
    const array = [
      { d: "01/02/2024" },
      { d: "15/01/2024" },
      { d: "31/12/2023" },
    ];
    expect(sorted(array, { d: Sort.asc }).map((i) => i.d)).toEqual([
      "31/12/2023",
      "15/01/2024",
      "01/02/2024",
    ]);
  });

  test("empty values go last when ascending and first when descending", () => {
    const array = [{ n: 2 }, { n: null }, { n: 1 }, {}, { n: "" }];
    expect(sorted(array, { n: Sort.asc }).slice(0, 2)).toEqual([
      { n: 1 },
      { n: 2 },
    ]);
    expect(sorted(array, { n: Sort.desc }).slice(3)).toEqual([
      { n: 2 },
      { n: 1 },
    ]);
  });

  test("supports nested property paths", () => {
    const array = [{ a: { b: 2 } }, { a: null }, { a: { b: 1 } }];
    expect(sorted(array, { "a.b": Sort.asc })).toEqual([
      { a: { b: 1 } },
      { a: { b: 2 } },
      { a: null },
    ]);
  });

  test("uses subsequent props as tie breakers", () => {
    const array = [
      { g: "x", n: 1 },
      { g: "y", n: 1 },
      { g: "x", n: 2 },
    ];
    expect(sorted(array, { g: Sort.asc, n: Sort.desc })).toEqual([
      { g: "x", n: 2 },
      { g: "x", n: 1 },
      { g: "y", n: 1 },
    ]);
  });

  test("empty array and empty sort object are no-ops", () => {
    expect(sorted([], { n: Sort.asc })).toEqual([]);
    const array = [{ n: 2 }, { n: 1 }];
    expect(sorted(array, {})).toEqual(array);
  });
});

describe("ArrayUtils.determineDateFormat", () => {
  it("detects storage date-times, whose format has [T] and [Z] literals", () => {
    expect(
      ArrayUtils.determineDateFormat("2026-11-15T10:20:30.000Z"),
    ).toBeDefined();
  });

  it("detects storage dates", () => {
    expect(ArrayUtils.determineDateFormat("2026-11-15")).toBeDefined();
  });

  it("ignores text that is not a date", () => {
    expect(ArrayUtils.determineDateFormat("not a date")).toBeUndefined();
  });
});
