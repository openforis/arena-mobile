import { LanguageCode, ArenaUserGroup } from "@openforis/arena-core";

import { SurveyReducer, SurveySliceActions } from "./reducer";
import type { SurveyState } from "./state";

jest.mock("localization", () => ({ i18n: { language: "en" } }));

const survey = {
  id: 1,
  uuid: "survey-uuid",
  props: {
    languages: ["fr", "en"],
    cycles: { "0": { dateStart: "2020-01-01" } },
  },
} as unknown as NonNullable<SurveyState["currentSurvey"]>;

describe("SurveyReducer", () => {
  const initialState = SurveyReducer(undefined, { type: "@@INIT" });

  it("starts with no local surveys", () => {
    expect(initialState).toEqual({ surveysLocal: [] });
  });

  it("currentSurveySet sets the survey, its default cycle and resets the user group", () => {
    const prev: SurveyState = {
      ...initialState,
      currentSurveyUserGroup: { uuid: "g" } as ArenaUserGroup,
      currentSurveyUserGroupReady: true,
    };
    const state = SurveyReducer(
      prev,
      SurveySliceActions.currentSurveySet({ survey }),
    );
    expect(state).toEqual({
      surveysLocal: [],
      currentSurvey: survey,
      currentSurveyPreferredLanguage: "en",
      currentSurveyCycle: "0",
      currentSurveyUserGroup: null,
      currentSurveyUserGroupReady: false,
    });
  });

  it("currentSurveySet uses the preferred language when specified", () => {
    const state = SurveyReducer(
      initialState,
      SurveySliceActions.currentSurveySet({
        survey,
        preferredLanguage: LanguageCode.fr,
      }),
    );
    expect(state.currentSurveyPreferredLanguage).toBe(LanguageCode.fr);
  });

  it("currentSurveySet with a null survey clears the current survey", () => {
    const withSurvey = SurveyReducer(
      initialState,
      SurveySliceActions.currentSurveySet({ survey }),
    );
    const state = SurveyReducer(
      withSurvey,
      SurveySliceActions.currentSurveySet({ survey: null }),
    );
    expect(state.currentSurvey).toBeNull();
    expect(state.currentSurveyCycle).toBeNull();
    expect(state.currentSurveyPreferredLanguage).toBeNull();
  });

  it("user group loading/set/reset update the ready flag", () => {
    const userGroup = { uuid: "g" } as ArenaUserGroup;
    let state = SurveyReducer(
      initialState,
      SurveySliceActions.currentSurveyUserGroupLoading(),
    );
    expect(state.currentSurveyUserGroupReady).toBe(false);
    state = SurveyReducer(
      state,
      SurveySliceActions.currentSurveyUserGroupSet(userGroup),
    );
    expect(state.currentSurveyUserGroup).toEqual(userGroup);
    expect(state.currentSurveyUserGroupReady).toBe(true);
    state = SurveyReducer(
      state,
      SurveySliceActions.currentSurveyUserGroupReset(),
    );
    expect(state.currentSurveyUserGroup).toBeNull();
    expect(state.currentSurveyUserGroupReady).toBe(false);
  });

  it("sets the cycle and the local surveys", () => {
    let state = SurveyReducer(
      initialState,
      SurveySliceActions.currentSurveyCycleSet("1"),
    );
    expect(state.currentSurveyCycle).toBe("1");
    const surveySummary = {
      id: 1,
      serverUrl: "localhost",
      remoteId: 1,
      uuid: survey.uuid,
      name: "survey",
      label: null,
      description: null,
      dateModified: "2024-01-01",
    };
    state = SurveyReducer(
      state,
      SurveySliceActions.surveysLocalSet([surveySummary]),
    );
    expect(state.surveysLocal).toEqual([surveySummary]);
  });
});
