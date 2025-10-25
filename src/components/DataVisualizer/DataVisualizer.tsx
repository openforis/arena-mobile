import { ScreenViewMode } from "model/ScreenViewMode";

import { DataTable } from "../DataTable";
import { DataList } from "../DataList";
import { VView } from "../VView";
import { DataTableProps } from "components/DataTable/DataTable";
import { DataListProps } from "components/DataList/DataList";

type Props = (DataTableProps | DataListProps) & {
  mode: string;
};

export const DataVisualizer = (props: Props) => {
  const { mode } = props;
  return (
    <VView style={{ flex: 1 }}>
      {mode === ScreenViewMode.table ? (
        <DataTable {...(props as any as DataTableProps)} />
      ) : (
        <DataList {...(props as any as DataListProps)} />
      )}
    </VView>
  );
};
