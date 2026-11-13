import { useCallback, useMemo, useState } from "react";

const itemsPerPageOptions = [10, 20, 50, 100];

type PaginationState = {
  itemsPerPage: number;
  page: number;
};

export const usePagination = ({
  items,
  initialItemsPerPage = itemsPerPageOptions[0]!,
}: {
  items: any[];
  initialItemsPerPage?: number;
}) => {
  const [state, setState] = useState<PaginationState>({
    itemsPerPage: initialItemsPerPage,
    page: 0,
  });

  const { itemsPerPage } = state;
  const numberOfPages = Math.ceil(items.length / itemsPerPage);
  // the items can shrink (e.g. filtered): the current page could be past the last one
  const page = Math.max(0, Math.min(state.page, numberOfPages - 1));
  const itemFrom = page * itemsPerPage;
  const itemTo = Math.min((page + 1) * itemsPerPage, items.length);
  const visibleItems = useMemo(
    () => items.slice(itemFrom, itemTo),
    [itemFrom, itemTo, items],
  );

  const onItemsPerPageChange = useCallback((itemsPerPageNext: number) => {
    setState({ itemsPerPage: itemsPerPageNext, page: 0 });
  }, []);

  const onPageChange = useCallback(
    (pageNext: number) =>
      setState((statePrev) => ({ ...statePrev, page: pageNext })),
    [],
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
