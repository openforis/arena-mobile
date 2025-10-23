import React, { useMemo } from "react";
import PropTypes from "prop-types";

import { Dropdown, Text } from "components";
import { SurveySelectors } from "state";

export const SrsDropdown = (props) => {
  const { editable, onChange, value } = props;

  const survey = SurveySelectors.useCurrentSurvey();
  const srss = survey.props.srs;
  const singleSrs = srss.length === 1;

  const items = useMemo(
    () => srss.map((srs) => ({ value: srs.code, label: srs.name })),
    [srss]
  );

  if (singleSrs) {
    return <Text>{srss[0].name}</Text>;
  }

  return (
    <Dropdown
      disabled={!editable}
      items={items}
      onChange={onChange}
      value={value}
    />
  );
};

SrsDropdown.propTypes = {
  editable: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
};
