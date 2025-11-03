import { useCallback, useMemo, useState } from "react";

const itemsPerPageOptions = [10, 20, 50, 100];

type PaginationState = {
  itemsPerPage: number;
  page: number;
};

const initialState: PaginationState = {
  itemsPerPage: itemsPerPageOptions[0]!,
  page: 0,
};

export const usePagination = ({ items }: any) => {
  const [state, setState] = useState(initialState);

  const { itemsPerPage, page } = state;
  const itemFrom = page * itemsPerPage;
  const itemTo = Math.min((page + 1) * itemsPerPage, items.length);
  const visibleItems = useMemo(
    () => items.slice(itemFrom, itemTo),
    [itemFrom, itemTo, items]
  );
  const numberOfPages = Math.ceil(items.length / itemsPerPage);

  const onItemsPerPageChange = useCallback((itemsPerPageNext: any) => {
    setState((statePrev) => ({ ...statePrev, itemsPerPage: itemsPerPageNext }));
  }, []);

  const onPageChange = useCallback(
    (pageNext: any) =>
      setState((statePrev) => ({ ...statePrev, page: pageNext })),
    []
  );

  return {
    itemFrom,
    itemTo,
    itemsPerPage,
    itemsPerPageOptions,
    numberOfPages,
    page,
    visibleItems,
    onItemsPerPageChange,
    onPageChange,
  };
};
