import PropTypes from "prop-types";

import { ScrollView } from "../ScrollView";

import appStyles from "appStyles";

export const ScreenView = ({ children }) => (
  <ScrollView style={appStyles.screenContainer}>{children}</ScrollView>
);

ScreenView.propTypes = {
  children: PropTypes.node,
};
