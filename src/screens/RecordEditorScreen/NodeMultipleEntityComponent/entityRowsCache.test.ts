import type {
  ArenaAnyNodeDef,
  ArenaRecord,
  ArenaRecordNode,
  ArenaSurvey,
} from "@openforis/arena-core";

import { EntityRowsCache } from "./entityRowsCache";

type TestNode = { uuid: string; value: unknown };
// only what the mocked Records.getChildren reads
type TestRecord = {
  cycle: string;
  childrenByEntityAndDef: Record<string, TestNode[]>;
};

const mockGetEntitySummaryValuesByNameFormatted = jest.fn();

jest.mock("model/utils/RecordUtils", () => ({
  RecordUtils: {
    getEntitySummaryValuesByNameFormatted: (params: unknown) =>
      mockGetEntitySummaryValuesByNameFormatted(params),
  },
}));

jest.mock("@openforis/arena-core", () => ({
  Records: {
    getChildren:
      (entity: { uuid: string }, defUuid: string) => (record: TestRecord) =>
        record.childrenByEntityAndDef[`${entity.uuid}_${defUuid}`] ?? [],
  },
}));

const survey = {} as ArenaSurvey;
const t = jest.fn();
const summaryDefs = [{ uuid: "def1" }] as ArenaAnyNodeDef[];
const entity = { uuid: "entity1" } as ArenaRecordNode;

const createRecord = (summaryNode: TestNode): ArenaRecord => {
  const record: TestRecord = {
    cycle: "0",
    childrenByEntityAndDef: { entity1_def1: [summaryNode] },
  };
  return record as unknown as ArenaRecord;
};

const getRow = (
  params: Partial<Parameters<typeof EntityRowsCache.getEntityRow>[0]> & {
    record: ArenaRecord;
  },
) =>
  EntityRowsCache.getEntityRow({
    survey,
    entity,
    lang: "en",
    summaryDefs,
    t,
    ...params,
  });

describe("EntityRowsCache.getEntityRow", () => {
  beforeEach(() => {
    mockGetEntitySummaryValuesByNameFormatted.mockReset();
    mockGetEntitySummaryValuesByNameFormatted.mockImplementation(
      ({ record }: { record: TestRecord }) => ({
        def1: record.childrenByEntityAndDef["entity1_def1"]![0]!.value,
      }),
    );
  });

  test("reuses the row when the summary nodes didn't change", () => {
    const summaryNode = { uuid: "node1", value: "a" };
    const row1 = getRow({ record: createRecord(summaryNode) });
    const row2 = getRow({ record: createRecord(summaryNode) });
    expect(row1).toEqual({ key: "entity1", uuid: "entity1", def1: "a" });
    expect(row2).toBe(row1);
    expect(mockGetEntitySummaryValuesByNameFormatted).toHaveBeenCalledTimes(1);
  });

  test("formats the values again when a summary node or the context change", () => {
    const row1 = getRow({
      record: createRecord({ uuid: "node1", value: "a" }),
    });
    const summaryNode2 = { uuid: "node1", value: "b" };
    const row2 = getRow({ record: createRecord(summaryNode2) });
    expect(row2).not.toBe(row1);
    expect(row2.def1).toBe("b");
    const row3 = getRow({ lang: "es", record: createRecord(summaryNode2) });
    expect(row3).not.toBe(row2);
    expect(mockGetEntitySummaryValuesByNameFormatted).toHaveBeenCalledTimes(3);
  });
});
