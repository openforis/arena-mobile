import React, { useMemo } from "react";

import { Dropdown, Text } from "components";
import { SurveySelectors } from "state";

type SrsDropdownProps = {
  editable?: boolean;
  onChange: (value: any) => Promise<void>;
  value?: any;
};

export const SrsDropdown = (props: SrsDropdownProps) => {
  const { editable, onChange, value } = props;

  const survey = SurveySelectors.useCurrentSurvey()!;
  const srss = survey.props.srs;
  const singleSrs = srss.length === 1;

  const items = useMemo(
    () =>
      srss.map((srs: any) => ({
        value: srs.code,
        label: srs.name,
      })),
    [srss]
  );

  if (singleSrs) {
    return <Text>{srss[0]!.name}</Text>;
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
