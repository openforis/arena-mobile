// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { ScrollView } from "../ScrollView";

// @ts-expect-error TS(2307): Cannot find module 'appStyles' or its correspondin... Remove this comment to see the full error message
import appStyles from "appStyles";

export const ScreenView = ({
  children
}: any) => (
  // @ts-expect-error TS(2749): 'ScrollView' refers to a value, but is being used ... Remove this comment to see the full error message
  <ScrollView style={appStyles.screenContainer}>{children}</ScrollView>
);

ScreenView.propTypes = {
  children: PropTypes.node,
};
