import {
  NodeDefs,
  Nodes,
  Record,
  RecordBuilder,
  RecordNodeBuilders,
  Records,
  Survey,
  SurveyBuilder,
  SurveyObjectBuilders,
  Surveys,
  User,
  UserFactory,
} from "@openforis/arena-core";

import { ConfirmUtils } from "../confirm";
import { RecordService } from "service/recordService";
import { DataEntrySelectors } from "./selectors";
import { DataEntryActions } from "./actions";

// isolate the actions from native modules, storage and UI: only arena-core runs for real
jest.mock("react-native", () => ({ Keyboard: { dismiss: jest.fn() } }));
jest.mock("utils", () => ({
  Errors: { getErrorMessage: jest.fn() },
  log: { debug: jest.fn(), error: jest.fn() },
  StringUtils: { truncateWithEllipsis: (s: string) => s },
  SystemUtils: {},
}));
jest.mock("localization", () => ({ i18n: { t: (key: string) => key } }));
jest.mock("model", () => ({
  SurveyDefs: {
    getNodeDefsLabelsOrNames: ({ survey, nodeDefUuids }: any) =>
      nodeDefUuids.map((uuid: string) => survey.nodeDefs[uuid].props.name),
  },
  SurveyUtils: jest.requireActual("model/utils/SurveyUtils").SurveyUtils,
}));
jest.mock("service/preferencesService", () => ({
  PreferencesService: { setSurveyRecordLastEditedPage: jest.fn() },
}));
jest.mock("service/recordFileService", () => ({ RecordFileService: {} }));
jest.mock("service/recordService", () => ({
  RecordService: { updateRecord: jest.fn(async ({ record }) => record) },
}));
jest.mock("screens/screenKeys", () => ({ screenKeys: {} }));
jest.mock("state/toast", () => ({ ToastActions: { show: jest.fn() } }));
jest.mock("../autoSync", () => ({
  AutoSyncActions: { markPending: () => ({ type: "markPending" }) },
}));
jest.mock("../confirm", () => ({
  ConfirmActions: {},
  ConfirmUtils: { confirm: jest.fn() },
}));
jest.mock("../deviceInfo", () => ({
  DeviceInfoActions: {},
  DeviceInfoSelectors: { selectIsPhone: () => true },
}));
jest.mock("../message", () => ({ MessageActions: {} }));
jest.mock("../survey", () => ({
  SurveyActions: {},
  SurveySelectors: {
    selectCurrentSurvey: (state: any) => state.survey,
    selectCurrentSurveyId: (state: any) => state.survey.id,
    selectCurrentSurveyPreferredLang: () => "en",
  },
}));
jest.mock("../remoteConnection", () => ({
  RemoteConnectionActions: {},
  RemoteConnectionSelectors: {
    selectLoggedUserSafe: (state: any) => state.user,
  },
}));
jest.mock("./actionsDataExport", () => ({}));
jest.mock("./actionsAutoSync", () => ({}));
jest.mock("./actionsRecordPreviousCycle", () => ({
  DataEntryActionsRecordPreviousCycle: {},
}));
jest.mock("./actionsRecordsClone", () => ({}));
jest.mock("./actionsRecordsImport", () => ({}));
jest.mock("./actionsRecordsRevalidate", () => ({}));
jest.mock("./actionsRecordSync", () => ({ DataEntryActionsRecordSync: {} }));
jest.mock("./selectors", () => ({
  DataEntrySelectors: {
    selectRecord: (state: any) => state.record,
    selectPreviousCycleRecord: () => null,
    selectRecordSyncInProgress: () => false,
    selectIsMaxCountReached: () => () => false,
    selectRecordEditLocked: () => false,
    selectIsLinkedToPreviousCycleRecord: () => false,
    selectRecordPageSelectorMenuOpen: () => false,
    selectCurrentPageEntity: jest.fn(),
  },
}));

const { entityDef, integerDef, decimalDef } = SurveyObjectBuilders;
const { entity, attribute } = RecordNodeBuilders;

const confirmMock = ConfirmUtils.confirm as jest.Mock;
const updateRecordMock = RecordService.updateRecord as jest.Mock;
const selectCurrentPageEntityMock =
  DataEntrySelectors.selectCurrentPageEntity as jest.Mock;

const user: User = UserFactory.createInstance({
  email: "test@openforis-arena.org",
  name: "test",
});

// "distance" is relevant only when the location has the expected number of individuals
const buildSurvey = async (
  distanceApplicableExpression: string,
  { keepNonApplicableValues = false } = {},
) => {
  const survey = await new SurveyBuilder(
    user,
    entityDef(
      "cluster",
      integerDef("cluster_id").key(),
      entityDef(
        "location",
        integerDef("location_id").key(),
        entityDef("individual", integerDef("individual_id").key()).multiple(),
        decimalDef("distance").applyIf(distanceApplicableExpression),
      ),
    ),
  ).build();
  const props = { ...survey.props, keepNonApplicableValues };
  return { ...survey, props } as Survey;
};

const buildRecord = (survey: Survey, individualsCount: number): Record => {
  const individuals = Array.from({ length: individualsCount }, (_, index) =>
    entity("individual", attribute("individual_id", index + 1)),
  );
  const record = new RecordBuilder(
    user,
    survey,
    entity(
      "cluster",
      attribute("cluster_id", 1),
      entity(
        "location",
        attribute("location_id", 1),
        ...individuals,
        attribute("distance", 3.2),
      ),
    ),
  ).build();
  // records loaded in the editor have no status flags
  for (const node of Records.getNodesArray(record)) {
    Nodes.removeStatusFlags({ node, sideEffect: true });
  }
  return record;
};

const getNodesByName = (survey: Survey, record: Record, name: string) => {
  const nodeDef = Surveys.getNodeDefByName({ survey, name });
  return Records.getNodesArray(record).filter(
    (node) => node.nodeDefUuid === nodeDef.uuid,
  );
};

const getDistanceValue = (survey: Survey, record: Record) =>
  getNodesByName(survey, record, "distance")[0]!.value;

// runs thunks too; "dispatched" lets tests wait for thunks dispatched without being awaited
const createDispatch = (state: any) => {
  const dispatched: Promise<any>[] = [];
  const dispatch: any = jest.fn((action: any) => {
    const result = Promise.resolve(
      typeof action === "function" ? action(dispatch, () => state) : action,
    );
    dispatched.push(result);
    return result;
  });
  dispatch.waitForAll = async () => {
    let count = -1;
    while (count !== dispatched.length) {
      count = dispatched.length;
      await Promise.all(dispatched);
    }
  };
  return dispatch;
};

const getStoredRecord = (): Record => updateRecordMock.mock.calls[0][0].record;

describe("DataEntryActions: clear values of attributes becoming non-applicable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("deleteNodes", () => {
    const deleteLastIndividual = async () => {
      const survey = await buildSurvey("count(individual) >= 5");
      const record = buildRecord(survey, 5);
      const individualToDelete = getNodesByName(
        survey,
        record,
        "individual",
      ).pop()!;
      const dispatch = createDispatch({ survey, record, user });
      await dispatch(DataEntryActions.deleteNodes([individualToDelete.uuid]));
      return { survey, record };
    };

    it("clears the value of an attribute becoming non-applicable after confirmation", async () => {
      confirmMock.mockResolvedValue(true);

      const { survey } = await deleteLastIndividual();

      expect(confirmMock).toHaveBeenCalledTimes(1);
      expect(confirmMock.mock.calls[0][0].messageParams.attributeNames).toBe(
        "- distance",
      );
      expect(updateRecordMock).toHaveBeenCalledTimes(1);
      const recordStored = getStoredRecord();
      expect(getNodesByName(survey, recordStored, "individual")).toHaveLength(
        4,
      );
      expect(getDistanceValue(survey, recordStored)).toBeNull();
    });

    it("doesn't delete anything when the user doesn't confirm", async () => {
      confirmMock.mockResolvedValue(false);

      const { survey, record } = await deleteLastIndividual();

      expect(confirmMock).toHaveBeenCalledTimes(1);
      expect(updateRecordMock).not.toHaveBeenCalled();
      // the record in the store is untouched
      expect(getNodesByName(survey, record, "individual")).toHaveLength(5);
      expect(getDistanceValue(survey, record)).toBe(3.2);
    });

    it("keeps the values when the survey is configured to keep non-applicable values", async () => {
      const survey = await buildSurvey("count(individual) >= 5", {
        keepNonApplicableValues: true,
      });
      const record = buildRecord(survey, 5);
      const individualToDelete = getNodesByName(
        survey,
        record,
        "individual",
      ).pop()!;
      const dispatch = createDispatch({ survey, record, user });

      await dispatch(DataEntryActions.deleteNodes([individualToDelete.uuid]));

      expect(confirmMock).not.toHaveBeenCalled();
      const recordStored = getStoredRecord();
      expect(getNodesByName(survey, recordStored, "individual")).toHaveLength(
        4,
      );
      expect(getDistanceValue(survey, recordStored)).toBe(3.2);
    });

    it("doesn't ask for confirmation when no value has to be cleared", async () => {
      const survey = await buildSurvey("count(individual) >= 3");
      const record = buildRecord(survey, 5);
      const individualToDelete = getNodesByName(
        survey,
        record,
        "individual",
      ).pop()!;
      const dispatch = createDispatch({ survey, record, user });

      await dispatch(DataEntryActions.deleteNodes([individualToDelete.uuid]));

      expect(confirmMock).not.toHaveBeenCalled();
      expect(updateRecordMock).toHaveBeenCalledTimes(1);
      expect(getDistanceValue(survey, getStoredRecord())).toBe(3.2);
    });
  });

  describe("addNewEntity", () => {
    const addIndividual = async () => {
      const survey = await buildSurvey("count(individual) < 5");
      const record = buildRecord(survey, 4);
      const location = getNodesByName(survey, record, "location")[0];
      const individualDef = Surveys.getNodeDefByName({
        survey,
        name: "individual",
      });
      expect(NodeDefs.isMultipleEntity(individualDef)).toBeTruthy();
      selectCurrentPageEntityMock.mockReturnValue({
        parentEntityUuid: location!.uuid,
        entityDef: individualDef,
      });
      const dispatch = createDispatch({ survey, record, user });
      dispatch(DataEntryActions.addNewEntity());
      await dispatch.waitForAll();
      return { survey, record };
    };

    it("clears the value of an attribute becoming non-applicable after confirmation", async () => {
      confirmMock.mockResolvedValue(true);

      const { survey } = await addIndividual();

      expect(confirmMock).toHaveBeenCalledTimes(1);
      const recordStored = getStoredRecord();
      expect(getNodesByName(survey, recordStored, "individual")).toHaveLength(
        5,
      );
      expect(getDistanceValue(survey, recordStored)).toBeNull();
    });

    it("doesn't add the entity when the user doesn't confirm", async () => {
      confirmMock.mockResolvedValue(false);

      await addIndividual();

      expect(confirmMock).toHaveBeenCalledTimes(1);
      expect(updateRecordMock).not.toHaveBeenCalled();
    });
  });
});
