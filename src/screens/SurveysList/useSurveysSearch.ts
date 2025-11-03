import { useCallback, useEffect, useState } from "react";

import { Objects } from "@openforis/arena-core";

export const useSurveysSearch = ({
  surveys
}: any) => {
  const [state, setState] = useState({
    surveysFiltered: surveys,
    searchValue: "",
  });
  const { surveysFiltered, searchValue } = state;

  useEffect(() => {
    setState({ surveysFiltered: surveys, searchValue: "" });
  }, [surveys]);

  const onSearchValueChange = useCallback(
    (val: any) => {
      const _surveysFiltered = surveys.filter((survey: any) => {
        const { name, defaultLabel } = survey;
        const prepareForSearch = (v: any) => Objects.isEmpty(v) ? "" : v.toLocaleLowerCase().trim();
        return (
          prepareForSearch(name).includes(prepareForSearch(val)) ||
          prepareForSearch(defaultLabel).includes(val)
        );
      });
      setState({ surveysFiltered: _surveysFiltered, searchValue: val });
    },
    [surveys]
  );

  return { onSearchValueChange, searchValue, surveysFiltered };
};
