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
        const { name, label, defaultLabel } = survey;
        const prepareForSearch = (v: any) =>
          Objects.isEmpty(v) ? "" : v.toLocaleLowerCase().trim().replace(/_/g, " ");
        const preparedVal = prepareForSearch(val);
        return (
          prepareForSearch(name).includes(preparedVal) ||
          prepareForSearch(label).includes(preparedVal) ||
          prepareForSearch(defaultLabel).includes(preparedVal)
        );
      });
      setState({ surveysFiltered: _surveysFiltered, searchValue: val });
    },
    [surveys]
  );

  return { onSearchValueChange, searchValue, surveysFiltered };
};
