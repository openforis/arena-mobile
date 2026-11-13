import { useMemo, useState } from "react";

import { Objects } from "@openforis/arena-core";

const prepareForSearch = (v: any) =>
  Objects.isEmpty(v) ? "" : v.toLocaleLowerCase().trim().replaceAll("_", " ");

export const useSurveysSearch = ({ surveys }: any) => {
  const [searchValue, setSearchValue] = useState("");

  // derived from surveys: the search value is kept when the surveys are refreshed
  const surveysFiltered = useMemo(() => {
    const preparedVal = prepareForSearch(searchValue);
    if (!preparedVal) return surveys;
    return surveys.filter(({ name, label, defaultLabel }: any) =>
      [name, label, defaultLabel].some((v) =>
        prepareForSearch(v).includes(preparedVal),
      ),
    );
  }, [surveys, searchValue]);

  return { onSearchValueChange: setSearchValue, searchValue, surveysFiltered };
};
