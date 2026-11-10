// eslint-disable-next-line no-restricted-imports -- the typed hooks are defined here
import { useDispatch, useSelector } from "react-redux";

// type-only import: keeps this module out of the store's require cycle
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
