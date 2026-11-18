import { User } from "@openforis/arena-core";

import {
  RemoteConnectionReducer,
  RemoteConnectionSliceActions,
} from "./reducer";

const user = { uuid: "user-uuid" } as unknown as User;
const otherUser = { uuid: "other-user-uuid" } as unknown as User;

describe("RemoteConnectionReducer", () => {
  const initialState = RemoteConnectionReducer(undefined, { type: "@@INIT" });

  it("starts with no user", () => {
    expect(initialState).toEqual({
      user: null,
      userLoading: false,
      userProfileIconInfo: { loaded: false, loading: false },
    });
  });

  it("userLoading keeps the last logged in user while loading", () => {
    const state = RemoteConnectionReducer(
      initialState,
      RemoteConnectionSliceActions.userLoading(user),
    );
    expect(state).toMatchObject({ user, userLoading: true });
    expect(
      RemoteConnectionReducer(
        initialState,
        RemoteConnectionSliceActions.userLoading(undefined),
      ),
    ).toMatchObject({ user: null, userLoading: true });
  });

  it("userSet sets the user and stops loading", () => {
    const loading = RemoteConnectionReducer(
      initialState,
      RemoteConnectionSliceActions.userLoading(user),
    );
    const state = RemoteConnectionReducer(
      loading,
      RemoteConnectionSliceActions.userSet(otherUser),
    );
    expect(state).toMatchObject({ user: otherUser, userLoading: false });
  });

  it("userProfileIconInfoSet replaces the profile icon info", () => {
    const iconInfo = { loaded: true, loading: false, uri: "file://icon" };
    let state = RemoteConnectionReducer(
      initialState,
      RemoteConnectionSliceActions.userProfileIconInfoSet(iconInfo),
    );
    expect(state.userProfileIconInfo).toEqual(iconInfo);
    state = RemoteConnectionReducer(
      state,
      RemoteConnectionSliceActions.userProfileIconInfoSet(null),
    );
    expect(state.userProfileIconInfo).toBeNull();
  });
});
