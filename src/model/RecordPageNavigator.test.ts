import {
  ArenaNodeDefEntity,
  ArenaRecord,
  ArenaRecordNode,
  RecordBuilder,
  RecordNodeBuilders,
  Records,
  ArenaSurvey,
  SurveyBuilder,
  SurveyObjectBuilders,
  Surveys,
  UserFactory,
} from "@openforis/arena-core";

import type { RecordCurrentPageEntity } from "./RecordCurrentPageEntity";
import {
  RecordPageEntityPointer,
  RecordPageNavigator,
} from "./RecordPageNavigator";

const { entityDef, integerDef, textDef } = SurveyObjectBuilders;
const { entity, attribute } = RecordNodeBuilders;

const user = UserFactory.createInstance({
  email: "test@openforis-arena.org",
  name: "test",
});

const { getNextEntityPointer, getPrevEntityPointer } = RecordPageNavigator;

const defNames = ["cluster", "general", "plot", "tree", "notes"] as const;
type DefName = (typeof defNames)[number];
type NodeName = "root" | "general" | "plot1" | "plot2" | "tree1" | "tree2";

describe("RecordPageNavigator", () => {
  let survey: ArenaSurvey;
  let record: ArenaRecord;
  let defs: Record<DefName, ArenaNodeDefEntity>;
  let nodes: Record<NodeName, ArenaRecordNode>;

  const next = (currentEntityPointer: RecordPageEntityPointer) =>
    getNextEntityPointer({ survey, record, currentEntityPointer });
  const prev = (currentEntityPointer: RecordPageEntityPointer) =>
    getPrevEntityPointer({ survey, record, currentEntityPointer });

  beforeAll(async () => {
    survey = await new SurveyBuilder(
      user,
      entityDef(
        "cluster",
        integerDef("cluster_id").key(),
        entityDef("general", textDef("remarks")),
        entityDef(
          "plot",
          integerDef("plot_id").key(),
          entityDef("tree", integerDef("tree_id").key()).multiple(),
        ).multiple(),
        entityDef("notes", textDef("note")).multiple(),
      ),
    ).build();

    defs = Object.fromEntries(
      defNames.map((name) => [
        name,
        Surveys.getNodeDefByName({ survey, name }),
      ]),
    ) as Record<DefName, ArenaNodeDefEntity>;
    // "notes" is rendered inside the parent page
    for (const name of ["cluster", "general", "plot", "tree"] as const) {
      defs[name].props.layout = {
        "0": { pageUuid: `page_${name}` },
      };
    }

    record = new RecordBuilder(
      user,
      survey,
      entity(
        "cluster",
        attribute("cluster_id", 1),
        entity("general", attribute("remarks", "r")),
        entity(
          "plot",
          attribute("plot_id", 1),
          entity("tree", attribute("tree_id", 1)),
          entity("tree", attribute("tree_id", 2)),
        ),
        entity("plot", attribute("plot_id", 2)),
        entity("notes", attribute("note", "n")),
      ),
    ).build();
    // RecordBuilder leaves the cycle unset
    record.cycle = "0";

    const root = Records.getRoot(record)!;
    const [plot1, plot2] = Records.getChildren(root, defs.plot.uuid)(record);
    const [tree1, tree2] = Records.getChildren(plot1!, defs.tree.uuid)(record);
    nodes = {
      root,
      general: Records.getChild(root, defs.general.uuid)(record)!,
      plot1: plot1!,
      plot2: plot2!,
      tree1: tree1!,
      tree2: tree2!,
    };
  });

  describe("getNextEntityPointer", () => {
    test("from root goes to the first child entity shown in own page", () => {
      expect(
        next({
          parentEntityUuid: null,
          entityDef: defs.cluster,
          entityUuid: nodes.root.uuid,
        }),
      ).toEqual({
        parentEntityUuid: nodes.root.uuid,
        entityDef: defs.general,
        entityUuid: nodes.general.uuid,
      });
    });

    test("accepts the current page entity (undefined uuids, entityDefUuid)", () => {
      const currentPageEntity: RecordCurrentPageEntity = {
        entityDefUuid: defs.plot.uuid,
        entityDef: defs.plot,
        parentEntityUuid: nodes.root.uuid,
      };
      expect(next(currentPageEntity)).toBeNull();
      expect(prev(currentPageEntity)).toEqual({
        parentEntityUuid: nodes.root.uuid,
        entityDef: defs.general,
        entityUuid: nodes.general.uuid,
      });
    });

    test("from single entity without child entities goes to next sibling (multiple entity list)", () => {
      expect(
        next({
          parentEntityUuid: nodes.root.uuid,
          entityDef: defs.general,
          entityUuid: nodes.general.uuid,
        }),
      ).toEqual({
        parentEntityUuid: nodes.root.uuid,
        entityDef: defs.plot,
        entityUuid: null,
      });
    });

    test("from last entity list under root returns null", () => {
      expect(
        next({
          parentEntityUuid: nodes.root.uuid,
          entityDef: defs.plot,
          entityUuid: null,
        }),
      ).toBeNull();
    });

    test("from entity list not shown in own page returns null", () => {
      expect(
        next({
          parentEntityUuid: nodes.root.uuid,
          entityDef: defs.notes,
          entityUuid: null,
        }),
      ).toBeNull();
    });

    test("from multiple entity goes to its first child entity list", () => {
      expect(
        next({
          parentEntityUuid: nodes.root.uuid,
          entityDef: defs.plot,
          entityUuid: nodes.plot1.uuid,
        }),
      ).toEqual({
        parentEntityUuid: nodes.plot1.uuid,
        entityDef: defs.tree,
        entityUuid: null,
      });
    });

    test("from multiple entity goes to its next sibling entity", () => {
      expect(
        next({
          parentEntityUuid: nodes.plot1.uuid,
          entityDef: defs.tree,
          entityUuid: nodes.tree1.uuid,
        }),
      ).toEqual({
        parentEntityUuid: nodes.plot1.uuid,
        entityDef: defs.tree,
        entityUuid: nodes.tree2.uuid,
        index: 1,
      });
    });

    test("from last child list goes to the next ancestor multiple entity", () => {
      expect(
        next({
          parentEntityUuid: nodes.plot1.uuid,
          entityDef: defs.tree,
          entityUuid: null,
        }),
      ).toEqual({
        parentEntityUuid: nodes.root.uuid,
        entityDef: defs.plot,
        entityUuid: nodes.plot2.uuid,
        index: 1,
      });
    });

    test("from last child list of last ancestor entity goes back to ancestor list", () => {
      expect(
        next({
          parentEntityUuid: nodes.plot2.uuid,
          entityDef: defs.tree,
          entityUuid: null,
        }),
      ).toEqual({
        parentEntityUuid: nodes.root.uuid,
        entityDef: defs.plot,
        entityUuid: null,
      });
    });
  });

  describe("getPrevEntityPointer", () => {
    test("from root returns null", () => {
      expect(
        prev({
          parentEntityUuid: null,
          entityDef: defs.cluster,
          entityUuid: nodes.root.uuid,
        }),
      ).toBeNull();
    });

    test("from entity list goes to the previous sibling entity", () => {
      expect(
        prev({
          parentEntityUuid: nodes.root.uuid,
          entityDef: defs.plot,
          entityUuid: null,
        }),
      ).toEqual({
        parentEntityUuid: nodes.root.uuid,
        entityDef: defs.general,
        entityUuid: nodes.general.uuid,
      });
    });

    test("from multiple entity goes back to its list", () => {
      expect(
        prev({
          parentEntityUuid: nodes.root.uuid,
          entityDef: defs.plot,
          entityUuid: nodes.plot1.uuid,
        }),
      ).toEqual({
        parentEntityUuid: nodes.root.uuid,
        entityDef: defs.plot,
        entityUuid: null,
      });
    });

    test("from first child entity goes to the parent entity", () => {
      expect(
        prev({
          parentEntityUuid: nodes.root.uuid,
          entityDef: defs.general,
          entityUuid: nodes.general.uuid,
        }),
      ).toEqual({
        parentEntityUuid: undefined,
        entityDef: defs.cluster,
        entityUuid: nodes.root.uuid,
      });
    });

    test("from first child list goes to the parent multiple entity", () => {
      expect(
        prev({
          parentEntityUuid: nodes.plot1.uuid,
          entityDef: defs.tree,
          entityUuid: null,
        }),
      ).toEqual({
        parentEntityUuid: nodes.root.uuid,
        entityDef: defs.plot,
        entityUuid: nodes.plot1.uuid,
      });
    });
  });
});
