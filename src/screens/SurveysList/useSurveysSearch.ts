import { useCallback, useEffect, useState } from "react";

import { Objects } from "@openforis/arena-core";

export const useSurveysSearch = ({ surveys }) => {
  const [state, setState] = useState({
    surveysFiltered: surveys,
    searchValue: "",
  });
  const { surveysFiltered, searchValue } = state;

  useEffect(() => {
    setState({ surveysFiltered: surveys, searchValue: "" });
  }, [surveys]);

  const onSearchValueChange = useCallback(
    (val) => {
      const _surveysFiltered = surveys.filter((survey) => {
        const { name, defaultLabel } = survey;
        const prepareForSearch = (v) =>
          Objects.isEmpty(v) ? "" : v.toLocaleLowerCase().trim();
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
