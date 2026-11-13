import {
  buildTaxonLabel,
  buildTaxonSearchKeys,
  extractPartsForSearch,
  filterTaxa,
  isTaxonMatchingFilter,
} from "./taxaSearch";

const taxon = (
  code: string,
  scientificName: string,
  other: Record<string, any> = {},
) => {
  const item: any = {
    uuid: code,
    props: { code, scientificName },
    vernacularNamesCount: 0,
    ...other,
  };
  item.searchKeys = buildTaxonSearchKeys(item);
  return item;
};

const unlistedTaxon = taxon("UNL", "Unlisted");
const unknownTaxon = taxon("UNK", "Unknown");

const quercus = taxon("QUE_ROB", "Quercus robur");
const quercusOak = taxon("QUE_ROB", "Quercus robur", {
  vernacularName: "English Oak",
  vernacularNameLangCode: "en",
  vernacularNamesCount: 2,
});
const pinus = taxon("PIN_SYL", "Pinus sylvestris", {
  vernacularNamesCount: 1,
  vernacularNamesJoint: "Scots Pine (English)",
});
const taxa = [quercus, quercusOak, pinus];

const filter = (filterInputValue: string | null, codeVisible = true) =>
  filterTaxa({
    codeVisible,
    filterInputValue,
    maxItems: 50,
    taxa,
    unknownTaxon,
    unlistedTaxon,
  });

describe("extractPartsForSearch", () => {
  test("splits, trims and lower-cases", () => {
    expect(extractPartsForSearch("  Quercus Robur ")).toEqual([
      "quercus",
      "robur",
    ]);
  });

  test("empty values", () => {
    expect(extractPartsForSearch(undefined)).toEqual([]);
    expect(extractPartsForSearch(null)).toEqual([]);
  });
});

describe("buildTaxonLabel", () => {
  test("with and without code", () => {
    expect(buildTaxonLabel({ codeVisible: true, taxon: quercus })).toBe(
      "(QUE_ROB) Quercus robur",
    );
    expect(buildTaxonLabel({ codeVisible: false, taxon: quercus })).toBe(
      "Quercus robur",
    );
  });
});

describe("buildTaxonSearchKeys", () => {
  test("lower-cases code, label and vernacular names", () => {
    expect(buildTaxonSearchKeys(quercusOak)).toEqual({
      code: "que_rob",
      labelParts: ["quercus", "robur"],
      labelPartsWithCode: ["(que_rob)", "quercus", "robur"],
      vernacularNameParts: ["english", "oak"],
      vernacularNamesJointParts: [],
    });
  });
});

describe("isTaxonMatchingFilter", () => {
  test("computes the search keys when missing", () => {
    const { searchKeys: _searchKeys, ...taxonWithoutKeys } = quercus;
    expect(
      isTaxonMatchingFilter({
        codeVisible: true,
        inputValueParts: ["que"],
        taxon: taxonWithoutKeys,
      }),
    ).toBe(true);
  });
});

describe("filterTaxa", () => {
  test("empty filter returns no items", () => {
    expect(filter(null)).toEqual([]);
    expect(filter("   ")).toEqual([]);
  });

  test("matches by code prefix", () => {
    expect(filter("pin_")).toEqual([pinus]);
  });

  test("matches every input part against the label parts (case-insensitive)", () => {
    expect(filter("QUE ROB")).toEqual([quercus]);
    expect(filter("pin syl")).toEqual([pinus]);
  });

  test("items with a vernacular name are included only when it matches (unless single)", () => {
    expect(filter("oak")).toEqual([quercusOak]);
    expect(filter("eng oak")).toEqual([quercusOak]);
    // the single vernacular name item is included when the label matches
    expect(filter("pinus")).toEqual([pinus]);
    expect(filter("scots")).toEqual([pinus]);
  });

  test("code in label matches only when the code is visible", () => {
    expect(filter("(pin", true)).toEqual([pinus]);
    expect(filter("(pin", false)).toEqual([unlistedTaxon, unknownTaxon]);
  });

  test("returns unlisted and unknown taxa when nothing matches", () => {
    expect(filter("xyz")).toEqual([unlistedTaxon, unknownTaxon]);
  });

  test("returns at most maxItems items", () => {
    expect(
      filterTaxa({
        codeVisible: true,
        filterInputValue: "q",
        maxItems: 1,
        taxa,
        unknownTaxon,
        unlistedTaxon,
      }),
    ).toEqual([quercus]);
  });
});
