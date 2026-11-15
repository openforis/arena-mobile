import { RecordEditViewMode } from "model/RecordEditViewMode";

import { SurveySliceActions } from "../survey/reducer";
import { SurveyOptionsReducer, SurveyOptionsSliceActions } from "./reducer";

jest.mock("localization", () => ({ i18n: { language: "en" } }));

const { setAllEntityListColumns, setEntityListColumns, setRecordEditViewMode } =
  SurveyOptionsSliceActions;

const init = () => SurveyOptionsReducer(undefined, { type: "@@INIT" });

describe("SurveyOptionsReducer", () => {
  it("has the form record edit view mode by default", () => {
    expect(init()).toEqual({ recordEditViewMode: RecordEditViewMode.form });
  });

  it("sets the record edit view mode", () => {
    const state = SurveyOptionsReducer(
      init(),
      setRecordEditViewMode("oneNode"),
    );
    expect(state.recordEditViewMode).toBe("oneNode");
  });

  it("sets and removes the entity list columns", () => {
    let state = SurveyOptionsReducer(
      init(),
      setAllEntityListColumns({ e1: ["a"] }),
    );
    state = SurveyOptionsReducer(
      state,
      setEntityListColumns({ entityDefUuid: "e2", columns: ["b", "c"] }),
    );
    expect(state.entityListColumnsByEntityDefUuid).toEqual({
      e1: ["a"],
      e2: ["b", "c"],
    });
    state = SurveyOptionsReducer(
      state,
      setEntityListColumns({ entityDefUuid: "e1", columns: null }),
    );
    expect(state.entityListColumnsByEntityDefUuid).toEqual({ e2: ["b", "c"] });
    state = SurveyOptionsReducer(
      state,
      setEntityListColumns({ entityDefUuid: "e2", columns: null }),
    );
    expect(state).not.toHaveProperty("entityListColumnsByEntityDefUuid");
  });

  it("resets when the current survey changes", () => {
    const state = SurveyOptionsReducer(
      { recordEditViewMode: "oneNode", entityListColumnsByEntityDefUuid: {} },
      SurveySliceActions.currentSurveySet({ survey: null }),
    );
    expect(state).toEqual(init());
  });
});
