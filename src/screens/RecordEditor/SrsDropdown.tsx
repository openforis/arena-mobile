import React, { useMemo } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Dropdown, Text } from "components";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { SurveySelectors } from "state";

export const SrsDropdown = (props: any) => {
  const { editable, onChange, value } = props;

  const survey = SurveySelectors.useCurrentSurvey();
  const srss = survey.props.srs;
  const singleSrs = srss.length === 1;

  const items = useMemo(
    () => srss.map((srs: any) => ({
      value: srs.code,
      label: srs.name
    })),
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
