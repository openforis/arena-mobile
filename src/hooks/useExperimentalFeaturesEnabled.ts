import { RemoteConnectionSelectors } from "state";

// experimental features are available only to logged in system administrators
export const useExperimentalFeaturesEnabled = () =>
  RemoteConnectionSelectors.useLoggedInUserIsSystemAdmin();
