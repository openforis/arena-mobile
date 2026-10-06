import {
  NodeDef,
  NodeDefs,
  NodeDefType,
  Record,
  RecordFactory,
  RecordFixer,
  RecordUpdater,
  RecordValidator,
  Records,
  Survey,
  Surveys,
  User,
  UserFactory,
} from "@openforis/arena-core";

import { RecordUtils } from "model/utils/RecordUtils";

import demoSurveyJson from "./demoSurvey.json";

const demoSurveyUuid = "3a3550d2-97ac-4db2-a9b5-ed71ca0a02d3";

// root key attributes are stored in dedicated columns of the record table:
// changing them would break the records already collected with the demo survey
const expectedRootKeyNames = [
  "level_1_unit_no",
  "survey_date",
  "survey_start_time",
];

// node defs added to the first version of the demo survey (records created with the
// first version don't have nodes for them)
const nodeDefNamesAddedAfterFirstVersion = [
  "tree_basal_area",
  "tree_wood_density",
  "site_details",
  "regeneration",
  "media",
];

const cycle = "0";

const user: User = UserFactory.createInstance({
  email: "test@openforis.org",
  name: "Test User",
});

const cloneSurvey = (): Survey =>
  JSON.parse(JSON.stringify(demoSurveyJson)) as Survey;

const getDef = (survey: Survey, name: string): NodeDef<any> =>
  Surveys.getNodeDefByName({ survey, name });

const getNodesByName = (survey: Survey, record: Record, name: string) =>
  Records.getNodesByDefUuid(getDef(survey, name).uuid)(record);

const getValues = (survey: Survey, record: Record, name: string) =>
  getNodesByName(survey, record, name).map((node) => node.value);

const categoryItemUuid = (
  survey: Survey,
  nodeDefName: string,
  codePaths: string[],
): string => {
  const categoryUuid = NodeDefs.getCategoryUuid(
    getDef(survey, nodeDefName) as any,
  )!;
  const item = Surveys.getCategoryItemByCodePaths({
    survey,
    categoryUuid,
    codePaths,
  });
  if (!item) throw new Error(`item not found: ${codePaths.join("/")}`);
  return item.uuid;
};

const createRecord = async (survey: Survey): Promise<Record> => {
  const { record } = await RecordUpdater.createRootEntity({
    user,
    survey,
    record: RecordFactory.createInstance({
      surveyUuid: survey.uuid,
      cycle,
      user,
    }),
  });
  return record;
};

const updateValue = async ({
  survey,
  record,
  name,
  value,
  index = 0,
}: {
  survey: Survey;
  record: Record;
  name: string;
  value: any;
  index?: number;
}): Promise<Record> => {
  const node = getNodesByName(survey, record, name)[index];
  if (!node) throw new Error(`node not found: ${name}[${index}]`);
  const { record: recordUpdated } = await RecordUpdater.updateAttributeValue({
    user,
    survey,
    record,
    attributeUuid: node.uuid,
    value,
  });
  return recordUpdated;
};

const addEntity = async ({
  survey,
  record,
  name,
  parentName,
}: {
  survey: Survey;
  record: Record;
  name: string;
  parentName?: string;
}): Promise<Record> => {
  const parentNode = parentName
    ? getNodesByName(survey, record, parentName)[0]!
    : Records.getRoot(record)!;
  const { record: recordUpdated } =
    await RecordUpdater.createNodeAndDescendants({
      user,
      survey,
      record,
      parentNode,
      nodeDef: getDef(survey, name),
    });
  return recordUpdated;
};

describe("Demo survey", () => {
  let survey: Survey;

  beforeAll(async () => {
    survey = await Surveys.buildAndAssocDependencyGraph(cloneSurvey());
  });

  describe("structure", () => {
    test("keeps the same UUID and root keys", () => {
      expect(survey.uuid).toBe(demoSurveyUuid);
      const rootDef = Surveys.getNodeDefRoot({ survey });
      const rootKeyNames = Surveys.getNodeDefKeys({
        survey,
        nodeDef: rootDef,
        cycle,
      }).map(NodeDefs.getName);
      expect(rootKeyNames).toEqual(expectedRootKeyNames);
    });

    test("has datePublished set (used to detect outdated local copies)", () => {
      expect(Date.parse(survey.datePublished as any)).not.toBeNaN();
    });

    test("node def names are unique", () => {
      const names = Surveys.getNodeDefsArray(survey).map(NodeDefs.getName);
      expect(new Set(names).size).toBe(names.length);
    });

    test("node def references are valid", () => {
      for (const nodeDef of Surveys.getNodeDefsArray(survey)) {
        const name = NodeDefs.getName(nodeDef);
        if (nodeDef.parentUuid) {
          expect({
            name,
            parent: !!Surveys.findNodeDefByUuid({
              survey,
              uuid: nodeDef.parentUuid,
            }),
          }).toEqual({ name, parent: true });
        }
        if (nodeDef.type === NodeDefType.code) {
          const categoryUuid = NodeDefs.getCategoryUuid(nodeDef as any)!;
          expect({
            name,
            category: !!survey.categories?.[categoryUuid],
          }).toEqual({ name, category: true });
          const parentCodeDefUuid = NodeDefs.getParentCodeDefUuid(
            nodeDef as any,
          );
          if (parentCodeDefUuid) {
            const parentCodeDef = Surveys.getNodeDefByUuid({
              survey,
              uuid: parentCodeDefUuid,
            });
            expect(NodeDefs.getCategoryUuid(parentCodeDef as any)).toBe(
              categoryUuid,
            );
          }
        }
        if (nodeDef.type === NodeDefType.taxon) {
          const taxonomyUuid = NodeDefs.getTaxonomyUuid(nodeDef as any)!;
          expect({
            name,
            taxonomy: !!survey.taxonomies?.[taxonomyUuid],
          }).toEqual({ name, taxonomy: true });
        }
        if (NodeDefs.isEntity(nodeDef)) {
          const layout = (nodeDef.props as any).layout?.[cycle];
          const layoutUuids = [
            ...(layout?.indexChildren ?? []),
            ...(layout?.layoutChildren ?? []).map((item: any) =>
              typeof item === "string" ? item : item.i,
            ),
          ];
          for (const uuid of layoutUuids) {
            const child = Surveys.findNodeDefByUuid({ survey, uuid });
            expect({
              name,
              uuid,
              childFound: child?.parentUuid === nodeDef.uuid,
            }).toEqual({ name, uuid, childFound: true });
          }
        }
      }
    });

    test("category items reference existing categories and levels", () => {
      const { categoryItemIndex = {} } = (survey.refData ?? {}) as any;
      for (const item of Object.values<any>(categoryItemIndex)) {
        const category = survey.categories?.[item.categoryUuid];
        if (!category) {
          throw new Error(`category not found: ${item.categoryUuid}`);
        }
        const levelUuids = Object.values(category.levels ?? {}).map(
          (level: any) => level.uuid,
        );
        expect(levelUuids).toContain(item.levelUuid);
        if (item.parentUuid) {
          expect(categoryItemIndex[item.parentUuid]).toBeDefined();
        }
      }
    });
  });

  describe("new record", () => {
    let record: Record;

    beforeAll(async () => {
      record = await createRecord(survey);
    });

    test("creates enumerated entities (ground cover)", () => {
      expect(getNodesByName(survey, record, "ground_cover")).toHaveLength(6);
      expect(getValues(survey, record, "ground_cover_class")).toHaveLength(6);
    });

    test("evaluates default values and calculated attributes", async () => {
      let r = record;
      r = await updateValue({
        survey,
        record: r,
        name: "level_1_unit_no",
        value: { itemUuid: categoryItemUuid(survey, "level_1_unit_no", ["1"]) },
      });
      // provided location comes from the sampling point data category
      const [givenLocation] = getValues(survey, r, "unit_location_given");
      expect(givenLocation).toMatchObject({ srs: "4326" });

      r = await updateValue({
        survey,
        record: r,
        name: "site_location",
        value: { x: givenLocation.x, y: givenLocation.y + 0.001, srs: "4326" },
      });
      const [distance] = getValues(
        survey,
        r,
        "site_distance_from_given_location",
      );
      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(120);

      for (let index = 0; index < 6; index++) {
        r = await updateValue({
          survey,
          record: r,
          name: "ground_cover_percent",
          value: 10,
          index,
        });
      }
      expect(getValues(survey, r, "ground_cover_total")).toEqual([60]);

      r = await updateValue({
        survey,
        record: r,
        name: "region",
        value: { itemUuid: categoryItemUuid(survey, "region", ["2"]) },
      });
      r = await updateValue({
        survey,
        record: r,
        name: "district",
        value: { itemUuid: categoryItemUuid(survey, "district", ["2", "3"]) },
      });

      const validation = await RecordValidator.validateRecord({
        user,
        survey,
        record: r,
      });
      expect(validation).toBeDefined();
    });

    test("evaluates calculated attributes in the tree table", async () => {
      let r = record;
      r = await updateValue({
        survey,
        record: r,
        name: "unit_accessibility",
        value: {
          itemUuid: categoryItemUuid(survey, "unit_accessibility", ["0"]),
        },
      });
      r = await addEntity({ survey, record: r, name: "unit_level_2" });
      r = await updateValue({
        survey,
        record: r,
        name: "second_level_unit_access",
        value: "true",
      });
      r = await addEntity({
        survey,
        record: r,
        name: "table_information",
        parentName: "unit_level_2",
      });
      expect(getValues(survey, r, "tree_no")).toEqual([1]);
      r = await updateValue({ survey, record: r, name: "tree_dbh", value: 20 });
      const [basalArea] = getValues(survey, r, "tree_basal_area");
      expect(basalArea).toBeCloseTo(Math.PI * 0.01, 6);

      const taxonomyUuid = NodeDefs.getTaxonomyUuid(
        getDef(survey, "tree_species") as any,
      )!;
      const taxon = Surveys.getTaxonByCode({
        survey,
        taxonomyUuid,
        taxonCode: "ACA_ELA",
      })!;
      r = await updateValue({
        survey,
        record: r,
        name: "tree_species",
        value: { taxonUuid: taxon.uuid },
      });
      expect(getValues(survey, r, "tree_wood_density")).toEqual([0.82]);
    });

    test("resolves the navigation target of coordinates with a distance validation", async () => {
      const r = await updateValue({
        survey,
        record,
        name: "level_1_unit_no",
        value: { itemUuid: categoryItemUuid(survey, "level_1_unit_no", ["2"]) },
      });
      const [givenLocation] = getValues(survey, r, "unit_location_given");
      const [siteLocationNode] = getNodesByName(survey, r, "site_location");
      const distanceTarget = await RecordUtils.getCoordinateDistanceTarget({
        survey,
        nodeDef: getDef(survey, "site_location"),
        record: r,
        node: siteLocationNode,
      });
      expect(distanceTarget).toMatchObject({
        x: givenLocation.x,
        y: givenLocation.y,
      });
    });

    test("generates auto-incremental keys in multiple entities", async () => {
      let r = record;
      r = await addEntity({ survey, record: r, name: "regeneration" });
      r = await addEntity({ survey, record: r, name: "regeneration" });
      expect(getValues(survey, r, "regeneration_no")).toEqual([1, 2]);
    });

    test("clears values no longer applicable after deleting an entity", async () => {
      let r = record;
      r = await addEntity({ survey, record: r, name: "regeneration" });
      r = await updateValue({
        survey,
        record: r,
        name: "regeneration_growth_form",
        value: {
          itemUuid: categoryItemUuid(survey, "regeneration_growth_form", ["3"]),
        },
      });
      // regeneration_stems_note is applicable only with at least 2 stems
      for (let count = 0; count < 2; count++) {
        r = await addEntity({
          survey,
          record: r,
          name: "regeneration_stem",
          parentName: "regeneration",
        });
      }
      r = await updateValue({
        survey,
        record: r,
        name: "regeneration_stems_note",
        value: "Forked",
      });
      const [, secondStem] = getNodesByName(survey, r, "regeneration_stem");
      const { record: recordUpdated, clearedDefUuids } =
        await RecordUpdater.deleteNodes({
          user,
          survey,
          record: r,
          nodeUuids: [secondStem!.uuid],
          clearNonApplicableValues: true,
        });
      expect([...clearedDefUuids!]).toEqual([
        getDef(survey, "regeneration_stems_note").uuid,
      ]);
      const [noteNode] = getNodesByName(
        survey,
        recordUpdated,
        "regeneration_stems_note",
      );
      expect(noteNode!.value ?? null).toBeNull();
    });
  });

  describe("records created with the previous version", () => {
    // simulates a record collected with the previous demo survey version,
    // loaded with the new one (see RecordRepository rowToRecord)
    const createPreviousVersionRecord = async (): Promise<Record> => {
      let record = await createRecord(survey);
      record = await updateValue({
        survey,
        record,
        name: "level_1_unit_no",
        value: { itemUuid: categoryItemUuid(survey, "level_1_unit_no", ["3"]) },
      });
      const nodeUuidsToDelete = nodeDefNamesAddedAfterFirstVersion.flatMap(
        (name) => getNodesByName(survey, record, name).map((node) => node.uuid),
      );
      const { record: recordPrevVersion } = await RecordUpdater.deleteNodes({
        user,
        survey,
        record,
        nodeUuids: nodeUuidsToDelete,
      });
      return recordPrevVersion;
    };

    test("are fixed inserting the missing single nodes", async () => {
      const recordPrevVersion = await createPreviousVersionRecord();
      expect(getNodesByName(survey, recordPrevVersion, "site_details")).toEqual(
        [],
      );

      const { record } = RecordFixer.fixRecord({
        survey,
        record: recordPrevVersion,
      });
      expect(getNodesByName(survey, record, "site_details")).toHaveLength(1);
      expect(getNodesByName(survey, record, "media")).toHaveLength(1);
      expect(getNodesByName(survey, record, "site_location")).toHaveLength(1);
      // existing values are kept
      expect(getValues(survey, record, "level_1_unit_no")).toEqual([
        { itemUuid: categoryItemUuid(survey, "level_1_unit_no", ["3"]) },
      ]);

      // new attributes can be edited
      const recordUpdated = await updateValue({
        survey,
        record,
        name: "site_slope",
        value: 30,
      });
      expect(getValues(survey, recordUpdated, "site_slope")).toEqual([30]);

      const validation = await RecordValidator.validateRecord({
        user,
        survey,
        record: recordUpdated,
      });
      expect(validation).toBeDefined();
    });

    test("nodes of removed node defs are dropped", async () => {
      const recordPrevVersion = await createPreviousVersionRecord();
      const rootNode = Records.getRoot(recordPrevVersion)!;
      const orphanNode = {
        uuid: "00000000-0000-4000-a000-000000000001",
        recordUuid: recordPrevVersion.uuid,
        nodeDefUuid: "00000000-0000-4000-a000-000000000002",
        parentUuid: rootNode.uuid,
        meta: { h: [rootNode.uuid] },
        value: "value of a removed attribute",
      };
      const recordWithOrphan = Records.addNode(orphanNode as any)(
        recordPrevVersion,
      );
      const { record } = RecordFixer.fixRecord({
        survey,
        record: recordWithOrphan,
      });
      expect(Records.getNodeByUuid(orphanNode.uuid)(record)).toBeUndefined();
    });
  });
});
